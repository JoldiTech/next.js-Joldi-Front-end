'use client';

import { useState, useEffect } from 'react';

export function GlobalErrorDisplay() {
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    // Load early errors
    if (typeof window !== 'undefined' && (window as any).__earlyErrors) {
      setErrors(prev => [...prev, ...(window as any).__earlyErrors]);
    }

    const handleError = (event: ErrorEvent) => {
      setErrors(prev => [...prev, `[Error] ${event.message} at ${event.filename}:${event.lineno}`]);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setErrors(prev => [...prev, `[Promise Rejection] ${String(event.reason)}`]);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Override console.error to catch React hydration errors
    const originalConsoleError = console.error;
    console.error = (...args) => {
      let msg = '';
      try {
        msg = args.map(a => {
          if (typeof a === 'object' && a !== null) {
            // Check if it's a DOM element or has circular references
            try {
              const cache = new Set();
              return JSON.stringify(a, (key, value) => {
                if (typeof value === 'object' && value !== null) {
                  if (cache.has(value)) return '[Circular]';
                  cache.add(value);
                  
                  // Handle DOM elements and React internals
                  if ((typeof HTMLElement !== 'undefined' && value instanceof HTMLElement) || value.constructor?.name?.includes('HTML') || value.$$typeof || value.constructor?.name === 'FiberNode') {
                    return `[${value.constructor?.name || 'DOMElement'}]`;
                  }
                }
                return value;
              });
            } catch(e) {
              return String(a);
            }
          }
          return String(a);
        }).join(' ');
      } catch(e) { msg = 'Error parsing console.error arguments'; }
      
      if (msg.includes('Hydration') || msg.includes('Minified React error') || msg.includes('Warning:')) {
        setErrors(prev => [...prev, `[React Error/Warning] ${msg}`]);
      }
      originalConsoleError.apply(console, args);
    };

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      console.error = originalConsoleError;
    };
  }, []);

  if (errors.length === 0) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: 'rgba(255,0,0,0.9)', color: 'white', padding: '10px', maxHeight: '50vh', overflowY: 'auto', fontFamily: 'monospace', fontSize: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <strong>Client-Side Errors Detected:</strong>
        <button onClick={() => setErrors([])} style={{ background: 'white', color: 'red', border: 'none', padding: '2px 8px', cursor: 'pointer' }}>Clear</button>
      </div>
      {errors.map((err, i) => (
        <div key={i} style={{ marginBottom: '5px', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '5px' }}>{err}</div>
      ))}
    </div>
  );
}
