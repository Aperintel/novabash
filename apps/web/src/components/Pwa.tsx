'use client';

import { useEffect } from 'react';

// Registers the service worker site-wide. Renders nothing. The worker gives the
// app offline support and makes it installable.
export function Pwa() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Registration is best-effort; the app works without it.
      });
    }
  }, []);
  return null;
}
