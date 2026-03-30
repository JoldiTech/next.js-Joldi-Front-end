'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers, Menu, X } from 'lucide-react';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const focusableElements = menuRef.current?.querySelectorAll('a, button');
      if (focusableElements && focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Do not show header on admin or login pages
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/login')) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-200 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md transition-colors duration-300">
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between" aria-label="Main Navigation">
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl tracking-tight text-zinc-900 dark:text-white" aria-label="Joldi Home">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          Joldi
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <Link href="/" aria-current={pathname === '/' ? 'page' : undefined} className={`hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors ${pathname === '/' ? 'text-zinc-900 dark:text-white' : ''}`}>Home</Link>
          <Link href="/solutions" aria-current={pathname?.startsWith('/solutions') ? 'page' : undefined} className={`hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors ${pathname?.startsWith('/solutions') ? 'text-zinc-900 dark:text-white' : ''}`}>Solutions</Link>
          <Link href="/pricing" aria-current={pathname === '/pricing' ? 'page' : undefined} className={`hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors ${pathname === '/pricing' ? 'text-zinc-900 dark:text-white' : ''}`}>Pricing</Link>
          <Link href="/faq" aria-current={pathname === '/faq' ? 'page' : undefined} className={`hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors ${pathname === '/faq' ? 'text-zinc-900 dark:text-white' : ''}`}>FAQ</Link>
          <Link href="/team" aria-current={pathname === '/team' ? 'page' : undefined} className={`hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors ${pathname === '/team' ? 'text-zinc-900 dark:text-white' : ''}`}>Team</Link>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <Link href="/#cta" className="px-4 py-2 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors">
            Waiting List
          </Link>
        </div>
        
        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-zinc-600 dark:text-zinc-400"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div 
          id="mobile-menu"
          ref={menuRef}
          className="md:hidden border-t border-zinc-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-950 overflow-hidden h-[calc(100vh-4rem)]"
        >
          <nav className="flex flex-col px-6 py-4 gap-4 text-base font-medium text-zinc-600 dark:text-zinc-400" aria-label="Mobile Navigation">
            <Link href="/" aria-current={pathname === '/' ? 'page' : undefined} onClick={() => setIsMobileMenuOpen(false)} className={pathname === '/' ? 'text-zinc-900 dark:text-white' : ''}>Home</Link>
            <Link href="/solutions" aria-current={pathname?.startsWith('/solutions') ? 'page' : undefined} onClick={() => setIsMobileMenuOpen(false)} className={pathname?.startsWith('/solutions') ? 'text-zinc-900 dark:text-white' : ''}>Solutions</Link>
            <Link href="/pricing" aria-current={pathname === '/pricing' ? 'page' : undefined} onClick={() => setIsMobileMenuOpen(false)} className={pathname === '/pricing' ? 'text-zinc-900 dark:text-white' : ''}>Pricing</Link>
            <Link href="/faq" aria-current={pathname === '/faq' ? 'page' : undefined} onClick={() => setIsMobileMenuOpen(false)} className={pathname === '/faq' ? 'text-zinc-900 dark:text-white' : ''}>FAQ</Link>
            <Link href="/team" aria-current={pathname === '/team' ? 'page' : undefined} onClick={() => setIsMobileMenuOpen(false)} className={pathname === '/team' ? 'text-zinc-900 dark:text-white' : ''}>Team</Link>
            <Link href="/#cta" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-2 mt-2 text-center rounded-full bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors">
              Waiting List
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
