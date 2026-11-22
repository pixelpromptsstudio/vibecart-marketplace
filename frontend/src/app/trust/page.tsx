import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Lock, RefreshCw, Award } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { buildBreadcrumbSchema, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Security & Buyer Protection',
  description: `Discover how ${SITE_NAME} verifies independent vendors, secures checkout transactions, and guarantees 100% Buyer Protection.`,
  alternates: { canonical: '/trust' },
};

export default function TrustPage() {
  const pillars = [
    {
      icon: ShieldCheck,
      title: '100% Buyer Protection',
      copy: 'Every purchase is backed by full refund protection if an item never arrives, is damaged in transit, or fails quality checks.',
    },
    {
      icon: Award,
      title: 'Verified Multi-Vendor Moderation',
      copy: 'Independent sellers and catalog additions go through verification and ongoing quality reviews before going live.',
    },
    {
      icon: RefreshCw,
      title: '7-Day Hassle-Free Returns',
      copy: 'Eligible orders include doorstep pickup and transparent timeline updates from approval to refund settlement.',
    },
    {
      icon: Lock,
      title: 'Server-Verified Totals & Security',
      copy: 'Cart pricing, stock reservation, and coupon eligibility are recalculated securely server-side with hardened headers and rate limits.',
    },
  ];

  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Security & Trust', url: '/trust' },
        ])}
      />
      <div className="legal-hero">
        <div className="container">
          <p style={{ fontSize: '12px', fontWeight: 800, color: '#D4FF00', letterSpacing: '0.1em', marginBottom: '8px' }}>
            VIBECART GUARANTEE
          </p>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, marginBottom: '10px' }}>
            Security, Trust &amp; Buyer Protection
          </h1>
          <p style={{ color: '#CBD5E1', fontSize: '15px', maxWidth: '640px' }}>
            Shop with confidence across independent sellers and flagship brands with end-to-end fulfillment visibility.
          </p>
        </div>
      </div>

      <section className="container" style={{ paddingBottom: '64px' }}>
        <Breadcrumbs items={[{ label: 'Security & Trust' }]} />
        <div className="product-catalog-grid" style={{ marginBottom: '32px' }}>
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.title} className="legal-card" style={{ padding: '24px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: '#EEF2FF',
                    color: '#4F46E5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <Icon size={22} />
                </div>
                <h2 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '8px', color: '#0F172A' }}>
                  {pillar.title}
                </h2>
                <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6 }}>
                  {pillar.copy}
                </p>
              </div>
            );
          })}
        </div>

        <div className="legal-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginBottom: '4px' }}>
              Ready to explore verified drops?
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B' }}>
              Browse thousands of curated listings or open your verified storefront on {SITE_NAME}.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link href="/search" className="btn-pill-dark">Explore Marketplace</Link>
            <Link href="/seller/register" className="btn-pill-outline">Sell on {SITE_NAME}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
