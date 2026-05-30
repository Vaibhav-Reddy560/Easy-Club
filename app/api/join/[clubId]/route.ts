import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// Use Firestore REST API with public API key to bypass server-side auth issues
async function getClubDocument(clubId: string) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  
  if (!projectId || !apiKey) {
    throw new Error('Firebase configuration missing');
  }

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/clubs/${clubId}?key=${apiKey}`;
  
  const res = await fetch(url, { cache: 'no-store' });
  
  if (!res.ok) {
    if (res.status === 404) return null;
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Firestore REST error: ${res.status}`);
  }
  
  return res.json();
}

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

export async function POST(request: Request, { params }: { params: Promise<{ clubId: string }> }) {
  try {
    const { clubId } = await params;
    
    if (!clubId) {
      return NextResponse.json({ error: 'Club ID is required' }, { status: 400 });
    }

    const doc = await getClubDocument(clubId);

    if (!doc) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    const club = parseFirestoreDocument(doc);

    if (club.membershipConfig?.mode !== 'fee-based' || !club.membershipConfig.feeAmount) {
      return NextResponse.json({ error: 'This club does not have a fee-based membership active' }, { status: 400 });
    }

    const feeAmount = club.membershipConfig.feeAmount;

    // Check if Razorpay keys exist in the club config
    if (!club.membershipConfig.razorpayKeyId || !club.membershipConfig.razorpayKeySecret) {
      return NextResponse.json({ 
        error: 'The founder of this club has not configured their payment gateway keys yet.' 
      }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: club.membershipConfig.razorpayKeyId,
      key_secret: club.membershipConfig.razorpayKeySecret,
    });

    const options = {
      amount: feeAmount * 100, // Amount in paise (Razorpay expects smallest currency unit)
      currency: "INR",
      receipt: `receipt_${clubId}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
    }

    return NextResponse.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      clubName: club.name,
      feeAmount: feeAmount
    });

  } catch (error: any) {
    console.error('Error initializing payment:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ clubId: string }> }) {
  // Simple GET endpoint to fetch club details for the Join page without initiating payment
  try {
    const { clubId } = await params;
    if (!clubId) return NextResponse.json({ error: 'Club ID is required' }, { status: 400 });

    const doc = await getClubDocument(clubId);
    if (!doc) return NextResponse.json({ error: 'Club not found' }, { status: 404 });

    const club = parseFirestoreDocument(doc);
    if (club.membershipConfig?.mode !== 'fee-based' || !club.membershipConfig.feeAmount) {
      return NextResponse.json({ error: 'This club does not have a fee-based membership active' }, { status: 400 });
    }

    return NextResponse.json({
      clubName: club.name,
      feeAmount: club.membershipConfig.feeAmount,
      razorpayKeyId: club.membershipConfig.razorpayKeyId
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
