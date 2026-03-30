'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { renderParsedHeading, getHomeCmsValue } from '../lib/utils';
import { fadeIn, getIcon } from '../constants';
const CTASection = dynamic(() => import('./CTASection').then(mod => mod.CTASection), { ssr: false });
import Image from 'next/image';

const MotionDiv = dynamic(() => import('motion/react').then((mod) => mod.motion.div), { ssr: false });
const AnimatePresence = dynamic(() => import('motion/react').then((mod) => mod.AnimatePresence), { ssr: false });

export const Solutions = ({ solutions, homeCms = [], onlyJoldi, isHome = false, siteSettings }: any) => {
  const params = useParams();
  const solutionId = params?.solutionId as string | undefined;
  const [localTab, setLocalTab] = useState(solutions[0]?.id || 'ecommerce');
  
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

  const activeTab = isHome ? localTab : (solutionId || solutions[0]?.id || 'ecommerce');
  const activeVertical = solutions.find((v: any) => v.id === activeTab) || solutions[0];
  
  const filteredOnlyJoldi = onlyJoldi?.filter((item: any) => item.solutionId === activeVertical?.id) || [];

  return (
    <>
      {/* Solutions (Verticals) - Tabbed Interface */}
      <section id="solutions" className={`py-12 px-6 border-t border-zinc-200 dark:border-zinc-800/50 transition-colors duration-300 ${isHome ? 'bg-white dark:bg-zinc-950' : 'bg-zinc-50 dark:bg-zinc-900/20'}`}>
        <div className="max-w-7xl mx-auto">
          <MotionDiv {...fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-zinc-900 dark:text-white">
              {renderParsedHeading(getHomeCmsValue(homeCms, 'solutions_heading', 'One platform, every module.'))}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto text-lg">
              {getHomeCmsValue(homeCms, 'solutions_text', "Stop paying for solutions you don't use. Joldi's modules work perfectly alone, and even better together.")}
            </p>
          </MotionDiv>

          {/* Desktop Tabs */}
          <div className="hidden lg:flex justify-center mb-12">
            <div className="inline-flex p-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-sm">
              {solutions.map((v: any) => (
                isHome ? (
                  <button
                    key={`desktop-${v.docId || v.id}`}
                    onClick={() => setLocalTab(v.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all ${
                      activeTab === v.id 
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md' 
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    {getIcon(v.id)} {renderParsedHeading(v.title)}
                  </button>
                ) : (
                  <Link
                    key={`desktop-${v.docId || v.id}`}
                    href={`/solutions/${v.id}`}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all ${
                      activeTab === v.id 
                        ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md' 
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    {getIcon(v.id)} {renderParsedHeading(v.title)}
                  </Link>
                )
              ))}
            </div>
          </div>
          
          {/* Mobile Nav */}
          <div className="lg:hidden mb-8 space-y-2">
            {solutions.map((v: any) => (
              isHome ? (
                <button
                  key={`mobile-${v.docId || v.id}`}
                  onClick={() => setLocalTab(v.id)}
                  className={`block w-full text-left px-6 py-4 rounded-2xl font-medium border ${
                    activeTab === v.id
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white'
                  }`}
                >
                  {renderParsedHeading(v.title)}
                </button>
              ) : (
                <Link
                  key={`mobile-${v.docId || v.id}`}
                  href={`/solutions/${v.id}`}
                  className={`block w-full px-6 py-4 rounded-2xl font-medium border ${
                    activeTab === v.id
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white'
                  }`}
                >
                  {renderParsedHeading(v.title)}
                </Link>
              )
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 flex-grow">
                <div className="p-10 lg:p-16 flex flex-col justify-center">

                  <h3 className="text-3xl lg:text-4xl font-display font-bold text-zinc-900 dark:text-white mb-6">
                    {renderParsedHeading(activeVertical?.title)}
                  </h3>
                  <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-10 leading-relaxed">
                    {activeVertical?.description}
                  </p>
                  
                  <div className="space-y-6 mb-10">
                    {activeVertical?.benefits?.map((feature: string) => (
                      <div key={feature} className="flex items-start gap-4">
                        <div className="mt-1 w-6 h-6 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-zinc-700 dark:text-zinc-300 text-lg">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 mb-10">
                    {isHome && (
                      <Link href={`/solutions/${activeVertical?.id}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors" aria-label={`Learn more about ${activeVertical?.title}`}>
                        Learn more about {activeVertical?.title} <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>

                  {activeVertical?.quote && (activeVertical.quote.oldWay || activeVertical.quote.joldiWay) && (
                    <div className="mt-auto pt-10 border-t border-zinc-100 dark:border-zinc-800/50">
                      <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {activeVertical.quote.oldWay && (
                            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                              <div className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-3">The Old Way</div>
                              <p className="text-zinc-600 dark:text-zinc-400 italic leading-relaxed">&quot;{activeVertical.quote.oldWay}&quot;</p>
                            </div>
                          )}
                          {activeVertical.quote.joldiWay && (
                            <div className="p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30">
                              <div className="text-[10px] uppercase tracking-widest font-bold text-blue-500 mb-3">The Joldi Way</div>
                              <p className="text-zinc-900 dark:text-white font-medium italic leading-relaxed">&quot;{activeVertical.quote.joldiWay}&quot;</p>
                            </div>
                          )}
                        </div>
                        {(activeVertical.quote.name || activeVertical.quote.position) && (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold">
                              {activeVertical.quote.name?.[0] || 'Q'}
                            </div>
                            <div>
                              <div className="font-bold text-zinc-900 dark:text-white">{activeVertical.quote.name}</div>
                              <div className="text-sm text-zinc-500 dark:text-zinc-400">{activeVertical.quote.position}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-zinc-50 dark:bg-zinc-950 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 min-h-[400px] lg:min-h-0 relative">
                  <Image 
                    key={activeVertical?.id}
                    src={(Array.isArray(homeCms) ? homeCms.find((item: any) => item.key === activeVertical?.id)?.value : homeCms?.[activeVertical?.id]?.value) || activeVertical?.image || `https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80`}
                    alt={`${activeVertical?.title} Interface`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    style={{ 
                      objectFit: (activeVertical?.fit || siteSettings?.fit || 'cover') as any, 
                      objectPosition: activeVertical?.position || siteSettings?.position || 'center' 
                    }}
                    loading="lazy"
                    quality={siteSettings?.quality || 80}
                  />
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Content Section - Under the Card */}
      {!isHome && (activeVertical?.pageContent || filteredOnlyJoldi.length > 0) && (
        <section className="py-12 px-6 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <MotionDiv
                key={`extra-${activeTab}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-24"
              >
                {activeVertical?.pageContent && (
                  <div className="max-w-4xl mx-auto">
                    <div className="markdown-body">
                      <Markdown remarkPlugins={[remarkGfm]}>{activeVertical.pageContent}</Markdown>
                    </div>
                  </div>
                )}
                
                {filteredOnlyJoldi.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/10 rounded-[3rem] border border-blue-100 dark:border-blue-800/30 p-12 lg:p-20">
                    <div className="max-w-4xl mx-auto">
                      <h3 className="text-4xl font-display font-bold text-zinc-900 dark:text-white mb-12 flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
                          <Zap className="w-8 h-8" />
                        </div>
                        {renderParsedHeading('The Joldi Difference')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {filteredOnlyJoldi.map((item: any) => (
                          <div key={item.id || item.title} className="bg-white dark:bg-zinc-900 p-10 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300 group">
                            <h4 className="font-bold text-2xl mb-6 text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{renderParsedHeading(item.title)}</h4>
                            <div className="flex flex-col gap-5">
                              <div className="flex items-center gap-4 text-zinc-700 dark:text-zinc-300">
                                <div className="text-[10px] uppercase tracking-[0.2em] font-black opacity-60 w-12 px-2 py-1 border border-zinc-300 dark:border-zinc-700 rounded flex items-center justify-center">Old</div>
                                <span className="text-lg line-through opacity-80">{item.old}</span>
                              </div>
                              <div className="flex items-center gap-4 text-blue-700 dark:text-blue-300">
                                <div className="text-[10px] uppercase tracking-[0.2em] font-black w-12 px-2 py-1 bg-blue-600 text-white rounded flex items-center justify-center shadow-md shadow-blue-500/20">New</div>
                                <span className="font-bold text-2xl">{item.new}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </MotionDiv>
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* CTA Section for individual solution pages */}
      {!isHome && (
        <CTASection {...ctaProps} homeCms={homeCms} />
      )}
    </>
  );
};
