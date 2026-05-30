import { NextResponse } from 'next/server';
import crypto from 'crypto';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

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
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/clubs/${clubId}?key=${API_KEY}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

async function patchClubDocument(clubId: string, newMembers: any[], newMemberEmails: string[]) {
  // We need to PATCH the document with updated members and memberEmails arrays
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/clubs/${clubId}?key=${API_KEY}&updateMask.fieldPaths=members&updateMask.fieldPaths=memberEmails`;
  
  const body = {
    fields: {
      members: toFirestoreValue(newMembers),
      memberEmails: toFirestoreValue(newMemberEmails),
    }
  };

  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return res.ok;
}

export async function POST(request: Request, { params }: { params: Promise<{ clubId: string }> }) {
  try {
    const { clubId } = await params;
    
    if (!clubId) {
      return NextResponse.json({ error: 'Club ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      name,
      email 
    } = body;

    if (!name || !email || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Fetch club to get the club's specific Razorpay Secret Key
    const rawDoc = await getClubDocument(clubId);
    if (!rawDoc) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    const club = parseFirestoreDocument(rawDoc);

    const secret = club.membershipConfig?.razorpayKeySecret;
    if (!secret) {
      return NextResponse.json({ error: 'The founder of this club has not configured their payment gateway keys yet.' }, { status: 500 });
    }

    // Verify Signature
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Payment verification failed. Invalid signature.' }, { status: 400 });
    }

    // Payment is verified! Now add the member to the club.
    const existingMember = (club.members || []).find((m: any) => m.email?.toLowerCase() === email.toLowerCase());
    if (existingMember) {
      return NextResponse.json({ error: 'You are already a member of this club' }, { status: 400 });
    }

    const newMember = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role: 'General Member',
      joinDate: new Date().toISOString().split('T')[0],
      basis: 'Fee Paid',
      testDetails: `Razorpay Payment ID: ${razorpay_payment_id}`
    };

    const updatedMembers = [...(club.members || []), newMember];
    const updatedEmails = [...(club.memberEmails || []), email];

    const success = await patchClubDocument(clubId, updatedMembers, updatedEmails);

    if (!success) {
      return NextResponse.json({ error: 'Failed to save membership details to database' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
