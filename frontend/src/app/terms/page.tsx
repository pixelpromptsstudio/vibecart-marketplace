import type { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { buildBreadcrumbSchema, SITE_NAME } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: `Review the Terms of Service governing shopping, multi-vendor listings, returns, and seller payouts on ${SITE_NAME}.`,
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Terms of Service', url: '/terms' },
        ])}
      />
      <div className="legal-hero">
        <div className="container">
          <p style={{ fontSize: '12px', fontWeight: 800, color: '#D4FF00', letterSpacing: '0.1em', marginBottom: '8px' }}>
            MARKETPLACE AGREEMENT
          </p>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, marginBottom: '10px' }}>
            Terms of Service
          </h1>
          <p style={{ color: '#CBD5E1', fontSize: '15px', maxWidth: '620px' }}>
            Clear rules ensuring fair commerce for shoppers, creators, and independent sellers across {SITE_NAME}.
          </p>
        </div>
      </div>

      <section className="container" style={{ paddingBottom: '64px' }}>
        <Breadcrumbs items={[{ label: 'Terms of Service' }]} />
        <div className="legal-card legal-article">
          <h2>1. Marketplace Role &amp; Verified Sellers</h2>
          <p>
            {SITE_NAME} operates as a curated multi-vendor platform connecting shoppers with approved independent brands and sellers. Sellers remain responsible for authentic inventory, accurate specifications, and timely dispatch.
          </p>

          <h2>2. Pricing, Coupons &amp; Orders</h2>
          <p>
            Final pricing, stock availability, shipping charges, and promotional coupon rules are validated server-side before order confirmation. Orders in <strong>Pending</strong> or <strong>Confirmed</strong> state may be cancelled directly from your <Link href="/orders" style={{ color: '#4F46E5', fontWeight: 700 }}>Order History</Link>.
          </p>

          <h2>3. 7-Day Returns &amp; Buyer Protection</h2>
          <p>
            Eligible physical goods qualify for our 7-day easy replacement or refund window when received damaged, defective, or materially different from their verified listing.
          </p>

          <h2>4. Seller Standards</h2>
          <p>
            Vendors publishing counterfeit, misleading, or policy-violating items are subject to immediate listing suspension via our moderation pipeline.
          </p>
        </div>
      </section>
    </>
  );
}
