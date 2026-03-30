import React from 'react';
import Admin from '@/src/Admin';
import { getSession } from '@/src/lib/session';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await getSession();

  // Middleware should have already handled this, but as a double check:
  if (!session && process.env.NODE_ENV === 'production') {
    redirect('/login');
  }

  const user = session?.user || (process.env.NODE_ENV === 'development' ? { email: 'dev@jolditech.com', role: 'admin' } : null);

  return (
    <Admin user={user} />
  );
}
