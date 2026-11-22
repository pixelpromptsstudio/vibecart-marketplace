import Link from 'next/link';
import { ArrowRight, Compass, Home, Search } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="container section-wrap" style={{ paddingBlock: '72px' }}>
      <div className="state-empty-card" style={{ maxWidth: '640px', marginInline: 'auto' }}>
        <div className="state-empty-badge">404 • ROUTE NOT FOUND</div>
        <h1 className="state-empty-title">We couldn&apos;t find that page.</h1>
        <p className="state-empty-copy">
          The product, storefront, or link may have moved or been archived. Explore trending drops or search the full marketplace instead.
        </p>
        <div className="state-empty-actions">
          <Link href="/" className="btn-pill-dark">
            <Home size={16} />
            <span>Back to Home</span>
          </Link>
          <Link href="/search" className="btn-pill-outline">
            <Search size={16} />
            <span>Explore Catalog</span>
            <ArrowRight size={15} />
          </Link>
          <Link href="/categories" className="btn-pill-outline">
            <Compass size={16} />
            <span>Categories</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
