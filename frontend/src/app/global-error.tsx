'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  retry,
  reset,
}: {
  error: Error & { digest?: string };
  retry?: () => void;
  reset?: () => void;
}) {
  useEffect(() => {
    console.error('Root layout error:', error);
  }, [error]);

  const handleRecover = () => {
    if (typeof retry === 'function') {
      retry();
    } else if (typeof reset === 'function') {
      reset();
    } else {
      window.location.href = '/';
    }
  };

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#0F172A',
          color: '#F8FAFC',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            width: '100%',
            padding: '36px',
            borderRadius: '20px',
            background: '#1E293B',
            border: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '6px 12px',
              borderRadius: '999px',
              background: 'rgba(212,255,0,0.14)',
              color: '#D4FF00',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '16px',
            }}
          >
            VIBECART RECOVERY
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 12px' }}>
            We hit an unexpected snag
          </h1>
          <p style={{ fontSize: '14px', color: '#CBD5E1', lineHeight: 1.6, marginBottom: '24px' }}>
            Please retry loading the application. If the issue persists, return to the storefront homepage.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleRecover}
              style={{
                padding: '12px 24px',
                borderRadius: '999px',
                border: 'none',
                background: '#D4FF00',
                color: '#0F172A',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Reload Page
            </button>
            <a
              href="/"
              style={{
                padding: '12px 24px',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#FFFFFF',
                textDecoration: 'none',
                fontWeight: 600,
              }}
            >
              Back to Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
