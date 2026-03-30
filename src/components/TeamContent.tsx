'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { renderParsedHeading, getHomeCmsValue } from '@/src/lib/utils';
import { fadeIn } from '@/src/constants';
import Image from 'next/image';
import MarkdownRenderer from './MarkdownRenderer';

const MotionDiv = dynamic(() => import('motion/react').then((mod) => mod.motion.div), { ssr: false });
const CTASection = dynamic(() => import('./CTASection').then(mod => mod.CTASection), { ssr: false });

export function TeamContent({ team, homeCms, siteSettings }: { team: any[], homeCms: any[], siteSettings: any }) {
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

  const teamFooterText = getHomeCmsValue(homeCms, 'team_footer_text', 'Our team is dedicated to building the future of business operations.');

  return (
    <>
      <section className="py-12 px-6 bg-white dark:bg-zinc-950 transition-colors duration-300 min-h-[60vh]">
        <div className="max-w-7xl mx-auto">
          <MotionDiv {...fadeIn} className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 text-zinc-900 dark:text-white">
              {renderParsedHeading(getHomeCmsValue(homeCms, 'team_heading', 'Meet the Team'))}
            </h2>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              {getHomeCmsValue(homeCms, 'team_text', 'The people building the future of business software.')}
            </p>
          </MotionDiv>
 
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member: any) => (
              <div key={member.id || member.name} className="group p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/50 text-center hover:shadow-xl transition-all duration-300">
                <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white dark:border-zinc-800 shadow-lg relative">
                  <Image 
                    src={member.image || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80'} 
                    alt={`Photo of ${member.name}`}
                    fill
                    sizes="128px"
                    style={{ 
                      objectFit: (member.fit || siteSettings?.fit || 'cover') as any, 
                      objectPosition: member.position || siteSettings?.position || 'center' 
                    }}
                    className="group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    quality={siteSettings?.quality || 80}
                  />
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">{member.name}</h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium mb-4">{member.role}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
 
          {teamFooterText && (
            <MotionDiv 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-20 text-center max-w-3xl mx-auto"
            >
              <div className="markdown-body text-zinc-600 dark:text-zinc-400">
                <MarkdownRenderer>{teamFooterText}</MarkdownRenderer>
              </div>
            </MotionDiv>
          )}
        </div>
      </section>
      <CTASection {...ctaProps} homeCms={homeCms} />
    </>
  );
}
