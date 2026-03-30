'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { renderParsedHeading } from '@/src/lib/utils';
import { fadeIn } from '@/src/constants';

const MotionDiv = dynamic(() => import('motion/react').then((mod) => mod.motion.div), { ssr: false });
const CTASection = dynamic(() => import('./CTASection').then(mod => mod.CTASection), { ssr: false });

export function PricingContent({ homeCms }: { homeCms: any[] }) {
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

  const getHomeCmsValue = (key: string, defaultValue: string) => {
    if (!Array.isArray(homeCms)) return defaultValue;
    const item = homeCms.find((i: any) => i.key === key);
    return item ? item.value : defaultValue;
  };

  return (
    <>
      <section className="py-12 px-6 bg-white dark:bg-zinc-950 transition-colors duration-300 min-h-[60vh] flex flex-col justify-center">
        <div className="max-w-4xl mx-auto text-center">
          <MotionDiv {...fadeIn}>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-zinc-900 dark:text-white">
              {renderParsedHeading(getHomeCmsValue('pricing_heading', 'Simple, predictable pricing.'))}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg mb-12">
              {getHomeCmsValue('pricing_text', 'Stop paying per-seat for five different tools. Pay one flat rate based on your business volume.')}
            </p>
          
          <div className="p-8 md:p-12 rounded-3xl border-2 border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 relative shadow-xl shadow-blue-500/10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide">
              Early Adopter Beta
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-left">
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">{renderParsedHeading('Founding Member Plan')}</h3>
                <p className="text-zinc-600 dark:text-zinc-400">All modules included. Unlimited users. Locked-in price forever.</p>
              </div>
              <div className="text-center md:text-right shrink-0">
                <div className="text-5xl font-display font-bold text-zinc-900 dark:text-white mb-2">$199<span className="text-xl text-zinc-600 dark:text-zinc-400 font-normal">/mo</span></div>
                <a href="#cta" onClick={(e) => { e.preventDefault(); document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' }); }} className="inline-block px-8 py-3 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors">
                  Claim Your Spot
                </a>
              </div>
            </div>
          </div>
          </MotionDiv>
        </div>
      </section>
      <CTASection {...ctaProps} homeCms={homeCms} />
    </>
  );
}
