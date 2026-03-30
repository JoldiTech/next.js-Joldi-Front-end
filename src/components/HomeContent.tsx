'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { renderParsedHeading, getYouTubeId, getHomeCmsValue } from '@/src/lib/utils';
import { ArrowRight, Play, CheckCircle2, X } from 'lucide-react';
import Image from 'next/image';

const Solutions = dynamic(() => import('./Solutions').then(mod => mod.Solutions), { ssr: true });
const MotionDiv = dynamic(() => import('motion/react').then((mod) => mod.motion.div), { ssr: false });
const CTASection = dynamic(() => import('./CTASection').then(mod => mod.CTASection), { ssr: false });
const LazyMarkdown = dynamic(() => import('./MarkdownRenderer'), { ssr: true });

export function HomeContent({ homeCms, basics, onlyJoldi, solutions, siteSettings }: any) {
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);

  // CTA form state
  const [formData, setFormData] = useState({
    name: '', company: '', email: '', phone: '', challenge: '', employees: '',
    ecommerce: '', ecommerceOther: '', pos: '', posOther: '',
    helpdesk: '', helpdeskOther: '', hr: '', hrOther: '',
    marketing: '', marketingOther: '', chat: '', chatOther: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('@/src/firebase');

      const trimmedData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : value])
      );

      await addDoc(collection(db, 'leads'), {
        ...trimmedData,
        createdAt: serverTimestamp(),
      });
      
      await fetch('/api/send-confirmation-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: trimmedData.email, name: trimmedData.name }),
      });

      setIsSubmitted(true);
      setFormData({
        name: '', company: '', email: '', phone: '', challenge: '', employees: '',
        ecommerce: '', ecommerceOther: '', pos: '', posOther: '',
        helpdesk: '', helpdeskOther: '', hr: '', hrOther: '',
        marketing: '', marketingOther: '', chat: '', chatOther: '',
      });
    } catch (err: any) {
      let errorMessage = 'Something went wrong. Please try again.';
      if (err.message) {
        if (err.message.includes('permission')) {
          errorMessage = 'Submission failed: Please ensure all required fields are filled correctly.';
        } else if (err.message.length < 150) {
          errorMessage = `Submission error: ${err.message}`;
        }
      } else if (err.code) {
        errorMessage = `Submission error: ${err.code}`;
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const ctaProps = { formData, handleInputChange, handleSubmit, isSubmitting, isSubmitted, error, homeCms };

  const handleWatchVideo = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowVideo(true);
    setTimeout(() => {
      videoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const videoId = getYouTubeId(getHomeCmsValue(homeCms, 'explainer_video', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'));
  const heroImageItem = homeCms.find((i: any) => i.id === 'hero_image');
  const heroImageUrl = heroImageItem?.value || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=2000&q=80';

  return (
    <>
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium mb-8 border border-blue-200 dark:border-blue-500/20">
              <span className="flex h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-500 animate-pulse" />
              {renderParsedHeading(getHomeCmsValue(homeCms, 'hero_tag', 'A Unified Business Operating System Suite'))}
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-8 text-zinc-900 dark:text-white leading-[1.1] tracking-tight">
              {renderParsedHeading(getHomeCmsValue(homeCms, 'hero_headline', 'Run your entire business from <b>one platform</b>.'))}
            </h1>
            
            <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 mb-12 leading-relaxed max-w-3xl mx-auto">
              {getHomeCmsValue(homeCms, 'hero_subheadline', 'Stop juggling six different tools with six different logins. Joldi brings your storefront, helpdesk, team chat, HR, and marketing into one system — with one bill.')}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/pricing" className="w-full sm:w-auto px-8 py-4 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors flex items-center justify-center gap-2 text-lg">
                Register for Early Access <ArrowRight className="w-5 h-5" />
              </Link>
              <button 
                  onClick={handleWatchVideo}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-medium border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors flex items-center justify-center gap-2 text-lg shadow-sm"
                >
                  <Play className="w-5 h-5" /> What is Joldi BOSS
                </button>
            </div>
          </div>

          <MotionDiv 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-20 relative mx-auto max-w-5xl"
            ref={videoRef}
          >
            <div className="rounded-2xl md:rounded-[2.5rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2 md:p-4">
              <div className="rounded-xl md:rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-950 aspect-[16/9] relative">
                {showVideo && videoId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : (
                  <Image 
                    src={heroImageUrl}
                    alt="Joldi Dashboard Interface"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
                    style={{ 
                      objectFit: (heroImageItem?.fit || siteSettings?.fit || 'cover') as any, 
                      objectPosition: heroImageItem?.position || siteSettings?.position || 'center' 
                    }}
                    priority
                    quality={siteSettings?.quality || 80}
                  />
                )}
              </div>
            </div>
          </MotionDiv>
        </div>
      </section>

      <Solutions solutions={solutions} homeCms={homeCms} onlyJoldi={onlyJoldi} sitePhotos={{}} ctaProps={ctaProps} isHome={true} siteSettings={siteSettings} />

      <section className="py-12 px-6 bg-white dark:bg-zinc-950 transition-colors duration-300 border-t border-zinc-200 dark:border-zinc-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-zinc-900 dark:text-white">
              {renderParsedHeading(getHomeCmsValue(homeCms, 'basics_heading', 'The Old Way vs. The <b>Joldi</b> Way'))}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {getHomeCmsValue(homeCms, 'basics_text', 'Stop juggling multiple subscriptions and logins.')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {basics.map((item: any) => (
              <div key={item.id || item.feature} className="p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">{renderParsedHeading(item.feature)}</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center shrink-0 mt-1">
                      <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1">Old Way</p>
                      <p className="text-zinc-600 dark:text-zinc-400">{item.oldWay}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center shrink-0 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Joldi Way</p>
                      <div className="text-zinc-900 dark:text-white font-medium markdown-body-sm">
                        <LazyMarkdown>{item.joldiWay}</LazyMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 px-6 border-t border-zinc-200 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-900/20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-zinc-900 dark:text-white">
              {renderParsedHeading(getHomeCmsValue(homeCms, 'only_joldi_heading', 'Why choose Joldi?'))}
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              {getHomeCmsValue(homeCms, 'only_joldi_text', 'We built a new way to run your business.')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {onlyJoldi.map((item: any) => (
              <div key={item.id || item.title} className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">{renderParsedHeading(item.title)}</h3>
                  <div className="space-y-4">
                    <p className="text-zinc-600 dark:text-zinc-400 line-through italic">{item.old}</p>
                    <div className="text-lg text-zinc-900 dark:text-white leading-relaxed markdown-body-sm">
                      <LazyMarkdown>{item.new}</LazyMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection {...ctaProps} homeCms={homeCms} />
    </>
  );
}
