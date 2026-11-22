import { ImageResponse } from 'next/og';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/seo';

export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background:
            'radial-gradient(circle at 88% 18%, rgba(212,255,0,0.22) 0%, transparent 45%), radial-gradient(circle at 12% 85%, rgba(79,70,229,0.35) 0%, transparent 50%), linear-gradient(135deg, #090D16 0%, #0F172A 55%, #111827 100%)',
          color: '#FFFFFF',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: '#D4FF00',
              color: '#0F172A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 34,
              fontWeight: 900,
            }}
          >
            V
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.03em' }}>
              {SITE_NAME}
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#D4FF00', letterSpacing: '0.14em' }}>
              CURATED MULTI-VENDOR MARKETPLACE
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '880px' }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              lineHeight: 1.06,
              letterSpacing: '-0.035em',
            }}
          >
            Shop the Vibe. Sell Your Style.
          </div>
          <div
            style={{
              fontSize: 26,
              color: '#CBD5E1',
              lineHeight: 1.38,
            }}
          >
            Verified flagship brands, shoppable Vibe Reels, transparent buyer protection & instant checkout.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            fontSize: 18,
            fontWeight: 700,
            color: '#E2E8F0',
          }}
        >
          <span
            style={{
              padding: '10px 20px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.16)',
            }}
          >
            Verified Sellers
          </span>
          <span
            style={{
              padding: '10px 20px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.16)',
            }}
          >
            Shoppable Video Reels
          </span>
          <span
            style={{
              padding: '10px 20px',
              borderRadius: '999px',
              background: '#D4FF00',
              color: '#0F172A',
              fontWeight: 800,
            }}
          >
            100% Buyer Protection
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
