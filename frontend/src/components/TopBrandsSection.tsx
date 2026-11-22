'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, MoreHorizontal } from 'lucide-react';

export interface BrandItem {
  _id?: string;
  name: string;
  slug: string;
  logo: string;
  productCount?: number;
}

const defaultBrands: BrandItem[] = [
  { name: 'Apple', slug: 'apple', logo: 'https://cdn.simpleicons.org/apple/111827' },
  { name: 'Samsung', slug: 'samsung', logo: 'https://cdn.simpleicons.org/samsung/1428A0' },
  { name: 'Nike', slug: 'nike', logo: 'https://cdn.simpleicons.org/nike/111827' },
  { name: 'Adidas', slug: 'adidas', logo: 'https://cdn.simpleicons.org/adidas/111827' },
  { name: 'boAt', slug: 'boat', logo: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=100' },
  {
    name: 'realme',
    slug: 'realme',
    logo: "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%23FFC915'/%3E%3Ctext x='32' y='41' text-anchor='middle' font-family='Arial,sans-serif' font-size='28' font-weight='900' fill='%23111827'%3ER%3C/text%3E%3C/svg%3E",
  },
  { name: 'OnePlus', slug: 'oneplus', logo: 'https://cdn.simpleicons.org/oneplus/F5010C' },
  { name: 'Sony', slug: 'sony', logo: 'https://cdn.simpleicons.org/sony/111827' },
  { name: 'Zebronics', slug: 'zebronics', logo: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=100' },
];

export const TopBrandsSection: React.FC<{ brands?: BrandItem[] }> = ({
  brands = defaultBrands,
}) => {
  const [failedSlugs, setFailedSlugs] = useState<Record<string, boolean>>({});
  const displayBrands = brands.length > 0 ? brands : defaultBrands;

  return (
    <div className="brands-sidebar-card">
      <div className="section-header" style={{ marginBottom: '16px' }}>
        <div>
          <span className="luxe-section-kicker">FEATURED HOUSES</span>
          <h3 className="section-title" style={{ fontSize: '20px' }}>Authorized Partner Brands</h3>
        </div>
        <Link href="/search" className="section-view-all">
          <span>View All</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      <div className="brands-grid-mini">
        {displayBrands.slice(0, 8).map((brand) => (
          <Link
            key={brand.slug}
            href={`/search?brand=${brand.name}`}
            className="brand-tile-item"
          >
            {failedSlugs[brand.slug] || !brand.logo ? (
              <div
                aria-hidden="true"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#EFF6FF',
                  color: '#1D4ED8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '12px',
                }}
              >
                {brand.name.slice(0, 2).toUpperCase()}
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={brand.logo}
                alt={brand.name}
                className="brand-tile-logo"
                onError={() =>
                  setFailedSlugs((prev) => ({ ...prev, [brand.slug]: true }))
                }
              />
            )}
            <span className="brand-tile-name">{brand.name}</span>
          </Link>
        ))}

        {/* More Brands */}
        <Link href="/search" className="brand-tile-item">
          <div
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B',
            }}
          >
            <MoreHorizontal size={20} />
          </div>
          <span className="brand-tile-name">More</span>
        </Link>
      </div>
    </div>
  );
};
