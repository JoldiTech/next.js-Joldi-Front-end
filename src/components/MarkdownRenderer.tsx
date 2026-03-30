import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

export default function MarkdownRenderer({ children, useRehypeRaw = false, ...props }: any) {
  const remarkPlugins = [remarkGfm];
  const rehypePlugins = useRehypeRaw ? [rehypeRaw] : [];
  
  return (
    <Markdown 
      remarkPlugins={remarkPlugins} 
      rehypePlugins={rehypePlugins} 
      {...props}
    >
      {children}
    </Markdown>
  );
}
