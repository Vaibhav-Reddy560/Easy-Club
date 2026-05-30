import { NextResponse } from 'next/server';

// Convert Firestore REST API field format to plain JS objects
function parseFirestoreValue(value: any): any {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return parseInt(value.integerValue);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.nullValue !== undefined) return null;
  if (value.mapValue) {
    const obj: Record<string, any> = {};
    for (const [k, v] of Object.entries(value.mapValue.fields || {})) {
      obj[k] = parseFirestoreValue(v);
    }
    return obj;
  }
  if (value.arrayValue) {
    return (value.arrayValue.values || []).map(parseFirestoreValue);
  }
  return null;
}

function parseFirestoreDocument(doc: any): any {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(doc.fields || {})) {
    result[key] = parseFirestoreValue(value);
  }
  return result;
}

// Convert a JS value to Firestore REST format
function toFirestoreValue(value: any): any {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return { integerValue: value.toString() };
    return { doubleValue: value };
  }
  if (typeof value === 'boolean') return { booleanValue: value };
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestoreValue) } };
  }
  if (typeof value === 'object') {
    const fields: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(value) };
}

async function getClubDocument(clubId: string) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/clubs/${clubId}?key=${apiKey}`;
  console.log("Fetching club:", url);
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    console.error(`Firestore fetch failed: ${res.status} ${res.statusText}`);
    try {
      const errText = await res.text();
      console.error("Firestore response:", errText);
    } catch(e) {}
    return null;
  }
  return res.json();
}

async function patchClubJCApplications(clubId: string, newApplications: any[]) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/clubs/${clubId}?key=${apiKey}&updateMask.fieldPaths=jcApplications`;
  
  const body = {
    fields: {
      jcApplications: toFirestoreValue(newApplications),
    }
  };

  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return res.ok;
}

export async function GET(request: Request, { params }: { params: Promise<{ clubId: string }> }) {
  try {
    const { clubId } = await params;
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    
    if (!clubId) return NextResponse.json({ error: 'Club ID is required' }, { status: 400 });

    const rawDoc = await getClubDocument(clubId);
    if (!rawDoc) return NextResponse.json({ error: 'Club not found' }, { status: 404 });

    const club = parseFirestoreDocument(rawDoc);
    console.log("Parsed club:", JSON.stringify(club, null, 2));
    
    if (!club.jcSelectionConfig?.isRecruitmentOpen) {
       return NextResponse.json({ error: 'Recruitment is currently closed for this club.' }, { status: 403 });
    }

    if (email) {
       console.log("Searching for email:", email, "in club", club.name);
       console.log("Club members:", JSON.stringify(club.members));

       const searchEmail = email.trim().toLowerCase();
       const member = (club.members || []).find((m: any) => m.email?.trim().toLowerCase() === searchEmail);
       if (!member) {
         console.log("Email not found. Returning 404.");
         return NextResponse.json({ error: 'Email not found in the club member registry.' }, { status: 404 });
       }
       
       const existingApp = (club.jcApplications || []).find((app: any) => app.memberEmail?.trim().toLowerCase() === searchEmail);
       if (existingApp) {
           console.log("Application already exists.");
           return NextResponse.json({ error: 'You have already submitted an application.' }, { status: 409 });
       }

       return NextResponse.json({ success: true, memberName: member.name, memberId: member.id, clubName: club.name });
    }

    return NextResponse.json({
      clubName: club.name,
      isRecruitmentOpen: club.jcSelectionConfig?.isRecruitmentOpen || false
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ clubId: string }> }) {
  try {
    const { clubId } = await params;
    
    if (!clubId) {
      return NextResponse.json({ error: 'Club ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { memberEmail, skills, experience, reason, ideas } = body;

    if (!memberEmail || !skills || !experience || !reason || !ideas) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const rawDoc = await getClubDocument(clubId);
    if (!rawDoc) return NextResponse.json({ error: 'Club not found' }, { status: 404 });

    const club = parseFirestoreDocument(rawDoc);

    if (!club.jcSelectionConfig?.isRecruitmentOpen) {
        return NextResponse.json({ error: 'Recruitment is currently closed' }, { status: 403 });
    }

    const searchEmail = memberEmail.trim().toLowerCase();
    const member = (club.members || []).find((m: any) => m.email?.trim().toLowerCase() === searchEmail);
    if (!member) {
      return NextResponse.json({ error: 'You must be a member of the club to apply.' }, { status: 403 });
    }

    const existingApp = (club.jcApplications || []).find((app: any) => app.memberEmail?.trim().toLowerCase() === searchEmail);
    if (existingApp) {
        return NextResponse.json({ error: 'You have already applied.' }, { status: 409 });
    }

    const application = {
        id: `app_${Math.random().toString(36).substr(2, 9)}`,
        memberId: member.id,
        memberName: member.name,
        memberEmail: memberEmail,
        skills,
        experience,
        reason,
        ideas,
        appliedAt: new Date().toISOString(),
        votes: []
    };

    const updatedApps = [...(club.jcApplications || []), application];

    const success = await patchClubJCApplications(clubId, updatedApps);

    if (!success) {
      return NextResponse.json({ error: 'Failed to submit application to database' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error submitting JC application:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
