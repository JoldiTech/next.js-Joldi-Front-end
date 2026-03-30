import React from 'react';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function safeStringify(obj: any): string {
  try {
    const cache = new Set();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) {
          return '[Circular]';
        }
        cache.add(value);
        
        // Handle DOM elements and React internals specifically to avoid deep recursion
        if (
          (typeof HTMLElement !== 'undefined' && value instanceof HTMLElement) ||
          (value.constructor && value.constructor.name && value.constructor.name.includes('HTML')) ||
          value.$$typeof || 
          (value.constructor && value.constructor.name === 'FiberNode') ||
          value.Provider ||
          value.Consumer
        ) {
          return `[${value.constructor?.name || 'DOMElement'}]`;
        }
      }
      if (typeof value === 'function') return '[Function]';
      return value;
    });
  } catch (err) {
    return '[Serialization Error]';
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  const serializedError = safeStringify(errInfo);
  console.error('Firestore Error: ', serializedError);
  
  // We still throw the original error synchronously so the app can handle it
  throw error;
}

export const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const renderParsedHeading = (text: string | null | undefined) => {
  if (!text || typeof text !== 'string') return text;
  return text.split('<b>').map((part, i) => {
    if (part.includes('</b>')) {
      const [bold, rest] = part.split('</b>');
      return (
        <React.Fragment key={i}>
          <span className="font-bold text-blue-600">{bold}</span>
          {rest}
        </React.Fragment>
      );
    }
    return part;
  });
};

export const getHomeCmsValue = (homeCms: any, key: string, defaultValue: string) => {
  if (!homeCms) return defaultValue;
  
  if (Array.isArray(homeCms)) {
    const item = homeCms.find((i: any) => i.key === key || i.id === key || i.docId === key);
    return item?.value || defaultValue;
  }
  
  if (typeof homeCms === 'object') {
    return homeCms[key]?.value || homeCms[key] || defaultValue;
  }
  
  return defaultValue;
};

const ALLOWED_WIDTHS = [16, 32, 48, 64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920, 2048, 3840];

export const getOptimizedImageUrl = (url: string, width?: number, height?: number, settings?: any) => {
  if (!url) return 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80';
  if (url.startsWith('data:') || url.startsWith('/api/images') || url.startsWith('/_next/image')) return url;
  
  const params = new URLSearchParams();
  params.set('url', url);
  
  // Next.js built-in optimizer requires 'w' to be one of the allowed sizes
  const targetWidth = width || 1200;
  const allowedWidth = ALLOWED_WIDTHS.find(w => w >= targetWidth) || ALLOWED_WIDTHS[ALLOWED_WIDTHS.length - 1];
  params.set('w', allowedWidth.toString());
  
  // Include 'q' parameter, default to 75 if not provided
  params.set('q', (settings?.quality || 75).toString());
  
  return `/_next/image?${params.toString()}`;
};
