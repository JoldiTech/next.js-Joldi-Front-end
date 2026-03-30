import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from '@/src/lib/firebase-admin';
import { getSession } from '@/src/lib/session';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user.email;
    const auth = getAdminAuth();
    
    const customToken = await auth.createCustomToken(email.toLowerCase(), {
      email: email.toLowerCase(),
      email_verified: true,
      role: 'admin'
    });

    return NextResponse.json({ success: true, customToken });
  } catch (error) {
    console.error('Token API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
