'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const PromoBannersSection: React.FC = () => {
  const promos = [
    {
      kicker: 'DEVICES',
      title: 'Flagship Mobiles',
      sub: 'Minimal design paired with pro-grade silicon.',
      cta: 'Discover',
      link: '/category/mobiles',
      image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400',
      bgColor: '#FAFAF9',
      isDark: false,
    },
    {
      kicker: 'APPAREL',
      title: 'Seasonal Tailoring',
      sub: 'Quiet silhouettes for everyday form.',
      cta: 'Explore Edit',
      link: '/category/fashion',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400',
      bgColor: '#F5F2EE',
      isDark: false,
    },
    {
      kicker: 'INTERIORS',
      title: 'Living Spaces',
      sub: 'Scandinavian furniture & calm textures.',
      cta: 'Shop Home',
      link: '/category/home-living',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
      bgColor: '#F3F5F2',
      isDark: false,
    },
    {
      kicker: 'PRO AUDIO',
      title: 'Acoustic Craft',
      sub: 'Studio precision & lossless sound.',
      cta: 'View Gear',
      link: '/category/electronics',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
      bgColor: '#18181B',
      isDark: true,
    },
  ];

  return (
    <section className="section-wrap" style={{ paddingTop: 0 }}>
      <div className="promo-banners-grid">
        {promos.map((promo, idx) => (
          <div
            key={idx}
            className="promo-banner-card"
            style={{
              backgroundColor: promo.bgColor,
              color: promo.isDark ? '#FAFAFA' : '#18181B',
              border: promo.isDark ? '1px solid #27272A' : '1px solid #E7E5E4',
            }}
          >
            <div className="promo-banner-content">
              <span
                style={{
                  display: 'block',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  color: promo.isDark ? '#A1A1AA' : '#71717A',
                  marginBottom: '6px',
                }}
              >
                {promo.kicker}
              </span>
              <h3
                className="promo-banner-title"
                style={{ color: promo.isDark ? '#FFFFFF' : '#18181B' }}
              >
                {promo.title}
              </h3>
              <p
                className="promo-banner-sub"
                style={{ color: promo.isDark ? '#D4D4D8' : '#52525B' }}
              >
                {promo.sub}
              </p>
              <Link
                href={promo.link}
                className="btn-pill-mini-dark"
                style={{
                  backgroundColor: promo.isDark ? '#FFFFFF' : '#18181B',
                  color: promo.isDark ? '#18181B' : '#FFFFFF',
                }}
              >
                <span>{promo.cta}</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={promo.image} alt={promo.title} className="promo-banner-img" />
          </div>
        ))}
      </div>
    </section>
  );
};
