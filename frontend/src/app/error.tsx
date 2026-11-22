'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';

export default function RouteError({
  error,
  retry,
  reset,
}: {
  error: Error & { digest?: string };
  retry?: () => void;
  reset?: () => void;
}) {
  useEffect(() => {
    console.error('Route boundary error:', error);
  }, [error]);

  const handleRecover = () => {
    if (typeof retry === 'function') {
      retry();
    } else if (typeof reset === 'function') {
      reset();
    } else {
      window.location.reload();
    }
  };

  return (
    <section className="container section-wrap" style={{ paddingBlock: '72px' }}>
      <div className="state-empty-card" style={{ maxWidth: '580px', marginInline: 'auto' }}>
        <div className="state-empty-badge" style={{ color: '#DC2626', borderColor: '#FECACA', background: '#FEF2F2' }}>
          <AlertTriangle size={14} />
          <span>TEMPORARY GLITCH</span>
        </div>
        <h1 className="state-empty-title">Something interrupted this page.</h1>
        <p className="state-empty-copy">
          {error.digest
            ? `Reference ID: ${error.digest}. Please try refreshing the view.`
            : 'We encountered an unexpected error loading this view. Your cart and session remain safe.'}
        </p>
        <div className="state-empty-actions">
          <button onClick={handleRecover} className="btn-pill-dark">
            <RotateCcw size={16} />
            <span>Try Again</span>
          </button>
          <Link href="/" className="btn-pill-outline">
            <Home size={16} />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
