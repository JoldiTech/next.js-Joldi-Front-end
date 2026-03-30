'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutGrid, ArrowLeft, ShieldCheck, Zap, Globe, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/src/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();
      
      if (data.success) {
        router.push('/admin');
      } else {
        setError(data.error || 'Unauthorized access');
        await auth.signOut();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/popup-blocked') {
        setError('Please allow popups for this site to sign in with Google.');
      } else {
        setError('An error occurred during Google login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-zinc-950 overflow-hidden">
      {/* Left Side: Immersive Brand Content */}
      <div className="hidden lg:flex relative flex-col justify-between p-12 bg-zinc-900 overflow-hidden">
        {/* Atmospheric Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Joldi</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <LayoutGrid className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-5xl font-display font-bold tracking-tight text-white leading-[1.1]">
              The Operating System <br />
              <span className="text-blue-400 italic">for Modern Business.</span>
            </h1>
            <p className="text-lg text-zinc-400 max-w-md leading-relaxed">
              Consolidate your entire enterprise into one unified platform. 
              Manage ecommerce, POS, helpdesk, and HR with Joldi.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-8">
            {[
              { icon: ShieldCheck, label: 'Enterprise Security' },
              { icon: Zap, label: 'Real-time Sync' },
              { icon: Globe, label: 'Global Scale' },
              { icon: Sparkles, label: 'AI Powered' }
            ].map((item) => (
              <div 
                key={item.label}
                className="flex items-center gap-3 text-zinc-300"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                  <item.icon className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-xs font-medium tracking-wide uppercase">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-12 border-t border-white/10">
          <p className="text-xs text-zinc-500 font-medium tracking-widest uppercase">
            © 2026 Joldi Tech. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex flex-col items-center justify-center p-8 lg:p-24 relative">
        <div className="lg:hidden absolute top-8 left-8">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Home</span>
          </Link>
        </div>

        <div className="w-full max-w-sm space-y-8">
          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-display font-bold tracking-tight text-zinc-900 dark:text-white">
              Admin Access
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              Sign in with your authorized Google account.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-50 text-zinc-900 dark:text-white font-medium transition-all shadow-sm active:scale-[0.98] cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {error && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm text-center">
                {error}
              </div>
            )}
          </div>

          <div className="pt-8 text-center">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              By signing in, you agree to our <Link href="/terms" className="underline hover:text-zinc-600 dark:hover:text-zinc-300">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-zinc-600 dark:hover:text-zinc-300">Privacy Policy</Link>.
            </p>
          </div>
        </div>

        {/* Subtle background element for mobile */}
        <div className="lg:hidden absolute bottom-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full -z-10" />
      </div>
    </div>
  );
}
