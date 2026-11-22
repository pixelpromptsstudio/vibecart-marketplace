'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';

export interface ProductItem {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  rating: number;
  reviewCount: number;
  stock?: number;
  trending?: boolean;
  featured?: boolean;
}

interface TrendingSectionProps {
  products: ProductItem[];
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({ products }) => {
  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">Trending Now</h2>
          <p className="section-subtitle">Most-wishlisted drops &amp; community favorites this week</p>
        </div>
        <Link href="/search?trending=true" className="section-view-all">
          <span>View All</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="products-scroll-grid">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
};
