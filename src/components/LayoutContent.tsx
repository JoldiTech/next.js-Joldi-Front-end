'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isExcludedPage = pathname?.startsWith('/admin') || pathname?.startsWith('/login');

  if (isExcludedPage) {
    return <main className="min-h-screen" id="main-content">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="pt-16 min-h-screen" id="main-content">{children}</main>
      <Footer />
    </>
  );
}
