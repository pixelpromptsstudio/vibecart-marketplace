'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';

export interface DealProduct {
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
  category?: { slug: string };
  stock?: number;
}

interface DealsRailSectionProps {
  products: DealProduct[];
}

export const DealsRailSection: React.FC<DealsRailSectionProps> = ({ products }) => {
  const [timeLeft, setTimeLeft] = useState({ hrs: 2, min: 48, sec: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.sec > 0) return { ...prev, sec: prev.sec - 1 };
        if (prev.min > 0) return { ...prev, min: prev.min - 1, sec: 59 };
        if (prev.hrs > 0) return { hrs: prev.hrs - 1, min: 59, sec: 59 };
        return { hrs: 3, min: 0, sec: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const electronics = products.filter(
    (p) =>
      p.category?.slug === 'electronics' ||
      p.category?.slug === 'mobiles' ||
      p.name.toLowerCase().includes('headphone') ||
      p.name.toLowerCase().includes('tv') ||
      p.name.toLowerCase().includes('watch')
  );

  const fashion = products.filter(
    (p) =>
      p.category?.slug === 'fashion' ||
      p.name.toLowerCase().includes('air max') ||
      p.name.toLowerCase().includes('shoe') ||
      p.name.toLowerCase().includes('shirt')
  );

  const electronicsList = (electronics.length > 0 ? electronics : products).slice(0, 4);
  const fashionList = (fashion.length > 0 ? fashion : products.slice(2)).slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {/* 1. Today's Curated Edit */}
      <section className="fk-deals-section">
        <div className="fk-deals-header">
          <div className="fk-deals-header-left">
            <div>
              <span className="luxe-section-kicker">SEASONAL SELECTION</span>
              <h2 className="fk-deals-title">Today’s Curated Edit</h2>
            </div>

            <div className="fk-timer-badge">
              <Clock size={13} />
              <span>
                Ends in {String(timeLeft.hrs).padStart(2, '0')}h :{' '}
                {String(timeLeft.min).padStart(2, '0')}m :{' '}
                {String(timeLeft.sec).padStart(2, '0')}s
              </span>
            </div>
          </div>

          <Link href="/search?trending=true" className="fk-view-all-btn">
            <span>View Collection</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="fk-deals-grid">
          {products.slice(0, 5).map((product, idx) => (
            <ProductCard key={product._id} product={product} priorityImage={idx < 2} />
          ))}
        </div>
      </section>

      {/* 2. Audio & Personal Tech */}
      <section className="fk-feature-block">
        <div className="fk-feature-side-card electronics">
          <div>
            <span className="luxe-section-kicker">SIGNATURE HARDWARE</span>
            <h3 className="fk-side-card-title">Audio &amp; Personal Tech</h3>
            <p className="fk-side-card-sub">
              Studio headphones, mirrorless optics &amp; flagship devices from ₹1,299.
            </p>
          </div>

          <div className="luxe-side-thumb">
            <Image
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
              alt="Audio & Personal Tech Collection"
              fill
              sizes="160px"
              style={{ objectFit: 'cover' }}
            />
          </div>

          <Link href="/category/electronics" className="fk-view-all-btn" style={{ width: '100%', justifyContent: 'center' }}>
            <span>Shop Electronics</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="fk-feature-products-rail">
          {electronicsList.map((product) => (
            <ProductCard key={`elec-${product._id}`} product={product} />
          ))}
        </div>
      </section>

      {/* 3. Wardrobe & Everyday Form */}
      <section className="fk-feature-block">
        <div className="fk-feature-side-card fashion">
          <div>
            <span className="luxe-section-kicker">SEASONAL WARDROBE</span>
            <h3 className="fk-side-card-title">Apparel &amp; Footwear</h3>
            <p className="fk-side-card-sub">
              Architectural outerwear, limited sneakers &amp; refined everyday essentials.
            </p>
          </div>

          <div className="luxe-side-thumb">
            <Image
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400"
              alt="Fashion & Footwear Collection"
              fill
              sizes="160px"
              style={{ objectFit: 'cover' }}
            />
          </div>

          <Link href="/category/fashion" className="fk-view-all-btn" style={{ width: '100%', justifyContent: 'center' }}>
            <span>Explore Wardrobe</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="fk-feature-products-rail">
          {fashionList.map((product) => (
            <ProductCard key={`fashion-${product._id}`} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
};
