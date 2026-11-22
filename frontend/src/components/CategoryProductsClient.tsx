'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpDown, SlidersHorizontal } from 'lucide-react';
import { categoryApi } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { VibeLoader } from '@/components/VibeLoader';

interface CategoryProductsClientProps {
  slug: string;
  initialCategory?: any | null;
  initialProducts?: any[];
}

export function CategoryProductsClient({
  slug,
  initialCategory = null,
  initialProducts = [],
}: CategoryProductsClientProps) {
  const [category, setCategory] = useState<any>(initialCategory);
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [loading, setLoading] = useState(!initialCategory);
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
      setProducts(initialProducts);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    categoryApi
      .getBySlug(slug)
      .then((res) => {
        if (cancelled) return;
        if (res?.category) {
          setCategory(res.category);
          setProducts(res.products || []);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, initialCategory, initialProducts]);

  const sortedProducts = useMemo(() => {
    const list = [...products];
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return list.sort((a, b) => b.price - a.price);
      case 'rating':
        return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'discount':
        return list.sort((a, b) => (b.discount || 0) - (a.discount || 0));
      default:
        return list;
    }
  }, [products, sortBy]);

  if (loading) {
    return (
      <div className="container" style={{ minHeight: '55vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <VibeLoader label="Loading category collection" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="container section-wrap" style={{ paddingBlock: '64px' }}>
        <div className="state-empty-card" style={{ maxWidth: '580px', marginInline: 'auto' }}>
          <div className="state-empty-badge">CATEGORY NOT FOUND</div>
          <h1 className="state-empty-title">We couldn&apos;t find this category</h1>
          <p className="state-empty-copy">
            Browse all curated marketplace departments or search across trending items.
          </p>
          <div className="state-empty-actions">
            <Link href="/categories" className="btn-pill-dark">View All Categories</Link>
            <Link href="/search" className="btn-pill-outline">Explore Catalog</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBlock: '28px 64px' }}>
      <Breadcrumbs
        items={[
          { label: 'Categories', href: '/categories' },
          { label: category.name },
        ]}
      />

      {/* Category Editorial Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
          color: '#FFFFFF',
          borderRadius: '24px',
          padding: '32px',
          marginBottom: '26px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <span
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '999px',
              background: 'rgba(212,255,0,0.16)',
              color: '#D4FF00',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.08em',
              marginBottom: '10px',
            }}
          >
            CURATED DEPARTMENT
          </span>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 900, marginBottom: '6px' }}>
            {category.name}
          </h1>
          <p style={{ color: '#CBD5E1', fontSize: '14px', maxWidth: '600px' }}>
            {category.description || `Explore verified ${category.name} listings with buyer protection and fast delivery.`}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#94A3B8' }}>
            {sortedProducts.length} items
          </span>
          <Link
            href={`/search?category=${encodeURIComponent(category.slug)}`}
            className="btn-pill-outline"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.22)' }}
          >
            <SlidersHorizontal size={14} />
            <span>Advanced Filters</span>
          </Link>
        </div>
      </div>

      {/* Sort Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#334155' }}>
          Showing {sortedProducts.length} verified {sortedProducts.length === 1 ? 'item' : 'items'}
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          <ArrowUpDown size={15} color="#64748B" />
          <label htmlFor="cat-sort" className="sr-only" style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>
            Sort by:
          </label>
          <select
            id="cat-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '12px',
              border: '1px solid var(--border-default)',
              background: '#FFFFFF',
              fontWeight: 700,
              fontSize: '13px',
              color: '#0F172A',
            }}
          >
            <option value="featured">Featured &amp; Trending</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Customer Rating</option>
            <option value="discount">Biggest Discount</option>
          </select>
        </div>
      </div>

      {sortedProducts.length === 0 ? (
        <div className="state-empty-card">
          <h2 className="state-empty-title">No products listed in {category.name} yet</h2>
          <p className="state-empty-copy">
            Check back soon or browse trending items across all departments.
          </p>
          <Link href="/search" className="btn-pill-dark">Explore All Products</Link>
        </div>
      ) : (
        <div className="product-catalog-grid">
          {sortedProducts.map((product, idx) => (
            <ProductCard key={product._id} product={product} priorityImage={idx < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
