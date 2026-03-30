import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/src/lib/firebase-admin';
import { login } from '@/src/lib/session';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ success: false, error: 'ID Token is required' }, { status: 400 });
    }

    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    const email = decodedToken.email;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email not found in token' }, { status: 400 });
    }

    // david@nmteaco.com is a super admin that always works.
    const superAdmins = ["david@nmteaco.com"];
    let isAuthorized = superAdmins.includes(email.toLowerCase());

    if (!isAuthorized) {
      const db = getAdminDb();
      const staffRef = db.collection('staff');
      const snapshot = await staffRef.where('email', '==', email.toLowerCase()).where('isAdmin', '==', true).get();
      if (!snapshot.empty) {
        isAuthorized = true;
      }
    }

    if (isAuthorized) {
      // Create session
      await login({ email: email.toLowerCase(), role: 'admin' });
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 });
    }
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
