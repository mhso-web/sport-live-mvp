'use client';

import { useEffect } from 'react';

interface StructuredDataProps {
  data: any;
}

export default function StructuredData({ data }: StructuredDataProps) {
  useEffect(() => {
    // Create script tags for structured data
    const scripts: HTMLScriptElement[] = [];
    
    if (data.structuredData) {
      const script1 = document.createElement('script');
      script1.type = 'application/ld+json';
      script1.innerHTML = JSON.stringify(data.structuredData);
      document.head.appendChild(script1);
      scripts.push(script1);
    }
    
    if (data.breadcrumbData) {
      const script2 = document.createElement('script');
      script2.type = 'application/ld+json';
      script2.innerHTML = JSON.stringify(data.breadcrumbData);
      document.head.appendChild(script2);
      scripts.push(script2);
    }
    
    // Cleanup on unmount
    return () => {
      scripts.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, [data]);
  
  return null;
}