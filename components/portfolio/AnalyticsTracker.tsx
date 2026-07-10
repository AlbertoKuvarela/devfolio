'use client';

import { useEffect, useRef } from 'react';

export function AnalyticsTracker({ portfolioId }: { portfolioId: string }) {
  const start = useRef(Date.now());

  useEffect(() => {
    const referrer = document.referrer || null;

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolioId, referrer }),
    }).catch(() => {});

    function sendDuration() {
      const pageTimeSeconds = Math.round((Date.now() - start.current) / 1000);
      const payload = JSON.stringify({ portfolioId, pageTimeSeconds });
      navigator.sendBeacon?.('/api/analytics/track', new Blob([payload], { type: 'application/json' }));
    }

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') sendDuration();
    });
    window.addEventListener('pagehide', sendDuration);

    return () => {
      window.removeEventListener('pagehide', sendDuration);
    };
  }, [portfolioId]);

  return null;
}
