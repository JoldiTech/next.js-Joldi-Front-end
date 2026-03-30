'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { renderParsedHeading } from '@/src/lib/utils';
import { fadeIn } from '@/src/constants';
import { ChevronDown } from 'lucide-react';

const MotionDiv = dynamic(() => import('motion/react').then((mod) => mod.motion.div), { ssr: false });
const AnimatePresence = dynamic(() => import('motion/react').then((mod) => mod.AnimatePresence), { ssr: false });
const CTASection = dynamic(() => import('./CTASection').then(mod => mod.CTASection), { ssr: false });

export function FAQContent({ faqs, homeCms }: { faqs: any[], homeCms: any[] }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // CTA form state
  const [formData, setFormData] = useState({
    name: '', company: '', email: '', phone: '', challenge: '',
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
        name: '', company: '', email: '', phone: '', challenge: '',
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
      <section className="py-12 px-6 border-t border-zinc-200 dark:border-zinc-800/50 bg-zinc-50 dark:bg-zinc-900/20 transition-colors duration-300 min-h-[60vh]">
        <div className="max-w-3xl mx-auto">
          <MotionDiv {...fadeIn} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-6 text-zinc-900 dark:text-white">
              {renderParsedHeading(getHomeCmsValue('faq_heading', 'Frequently Asked Questions'))}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              {getHomeCmsValue('faq_text', '')}
            </p>
          </MotionDiv>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={faq.id || faq.question} className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left font-semibold text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                  aria-expanded={openFaq === i}
                  aria-controls={`faq-answer-${i}`}
                >
                  {renderParsedHeading(faq.question)}
                  <ChevronDown className={`w-5 h-5 text-zinc-600 dark:text-zinc-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <MotionDiv 
                      id={`faq-answer-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {faq.answer}
                      </div>
                    </MotionDiv>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CTASection {...ctaProps} homeCms={homeCms} />
    </>
  );
}
