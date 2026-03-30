'use client';

import React from 'react';
import { motion } from 'motion/react';
import { fadeIn } from '@/src/constants';
import Markdown from 'react-markdown';

export function TermsContent({ termsOfService }: { termsOfService: string }) {
  return (
    <section className="py-24 px-6 bg-white dark:bg-zinc-950 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <motion.div {...fadeIn}>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-8 text-zinc-900 dark:text-white">Terms of Service</h1>
          <div className="markdown-body">
            {termsOfService ? (
              <Markdown>{termsOfService}</Markdown>
            ) : (
              <p>Terms of service content is currently unavailable.</p>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
