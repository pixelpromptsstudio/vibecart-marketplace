'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Percent,
  ShieldCheck,
  Truck,
} from 'lucide-react';

interface HeroSlide {
  edition: string;
  title: string;
  vibeWord: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  priceNote: string;
  theme: 'light' | 'dark';
  surfaceBg: string;
}

const slides: HeroSlide[] = [
  {
    edition: 'CURATED EDITION • 01',
    title: 'Precision Sound,',
    vibeWord: 'Sculpted Pure.',
    subtitle: 'Flagship acoustic engineering from Sony, Apple & Bose — paired with complimentary express delivery.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    ctaText: 'Shop Audio',
    ctaLink: '/category/electronics',
    priceNote: 'Starting ₹1,299',
    theme: 'light',
    surfaceBg: '#F4F3EF',
  },
  {
    edition: 'FLAGSHIP COLLECTION • 02',
    title: 'Titanium Craft,',
    vibeWord: 'Effortless Speed.',
    subtitle: 'Latest Pro smartphones & studio optics from Apple, Samsung & OnePlus with zero-cost EMI options.',
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800',
    ctaText: 'Explore Mobiles',
    ctaLink: '/category/mobiles',
    priceNote: 'Exchange Bonus Available',
    theme: 'dark',
    surfaceBg: '#18181B',
  },
  {
    edition: 'SEASONAL WARDROBE • 03',
    title: 'Tailored Lines,',
    vibeWord: 'Modern Form.',
    subtitle: 'Elevated minimalist silhouettes, limited footwear releases & timeless everyday wardrobe staples.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
    ctaText: 'Explore Wardrobe',
    ctaLink: '/category/fashion',
    priceNote: 'Autumn / Winter Edit',
    theme: 'light',
    surfaceBg: '#F3EFEA',
  },
  {
    edition: 'ARCHITECTURAL LIVING • 04',
    title: 'Designed for',
    vibeWord: 'Quiet Spaces.',
    subtitle: 'Scandinavian armchairs, tactile bouclé textures & warm lighting crafted for contemporary interiors.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
    ctaText: 'Shop Living',
    ctaLink: '/category/home-living',
    priceNote: 'Curated Home Edit',
    theme: 'light',
    surfaceBg: '#F1F4F1',
  },
];

export const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ hrs: 3, min: 45, sec: 18 });

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.sec > 0) return { ...prev, sec: prev.sec - 1 };
        if (prev.min > 0) return { ...prev, min: prev.min - 1, sec: 59 };
        if (prev.hrs > 0) return { hrs: prev.hrs - 1, min: 59, sec: 59 };
        return { hrs: 4, min: 0, sec: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const slide = slides[currentSlide];
  const isDark = slide.theme === 'dark';

  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-grid">
          {/* Primary Editorial Gallery Showcase */}
          <div className="fk-hero-carousel-wrap" style={{ margin: 0 }}>
            <div
              className="fk-carousel-slide"
              style={{
                backgroundColor: slide.surfaceBg,
                color: isDark ? '#FAFAFA' : '#18181B',
              }}
            >
              {/* Editorial Typography Column */}
              <div className="fk-carousel-content">
                <div
                  className="fk-banner-eyebrow"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.1)' : '#FFFFFF',
                    color: isDark ? '#E4E4E7' : '#52525B',
                    border: isDark ? '1px solid rgba(255,255,255,0.16)' : '1px solid #E4E4E7',
                  }}
                >
                  <span>{slide.edition}</span>
                </div>

                <h1 className="fk-banner-heading">
                  {slide.title}
                  <br />
                  <span style={{ color: isDark ? '#A1A1AA' : '#52525B', fontWeight: 700 }}>
                    {slide.vibeWord}
                  </span>
                </h1>

                <p className="fk-banner-sub" style={{ color: isDark ? '#D4D4D8' : '#52525B' }}>
                  {slide.subtitle}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <Link
                    href={slide.ctaLink}
                    className="fk-banner-cta-btn"
                    style={{
                      background: isDark ? '#FFFFFF' : '#18181B',
                      color: isDark ? '#18181B' : '#FFFFFF',
                    }}
                  >
                    <span>{slide.ctaText}</span>
                    <ArrowRight size={15} />
                  </Link>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: isDark ? '#A1A1AA' : '#71717A',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {slide.priceNote}
                  </span>
                </div>
              </div>

              {/* Clean Gallery Framed Image */}
              <div className="fk-banner-img-wrap">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  sizes="(max-width: 768px) 320px, 380px"
                  priority={currentSlide === 0}
                  className="fk-banner-img"
                  style={{ objectFit: 'cover' }}
                  key={slide.image}
                />
              </div>

              {/* Subtle Navigation Controls */}
              <button
                type="button"
                className="fk-carousel-nav-btn prev"
                onClick={prevSlide}
                aria-label="Previous Slide"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="fk-carousel-nav-btn next"
                onClick={nextSlide}
                aria-label="Next Slide"
              >
                <ChevronRight size={18} />
              </button>

              {/* Editorial Indicators */}
              <div className="fk-carousel-indicators">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`Slide ${idx + 1}`}
                    className={`fk-indicator-dot ${idx === currentSlide ? 'active' : ''}`}
                    style={{
                      background:
                        idx === currentSlide
                          ? isDark
                            ? '#FFFFFF'
                            : '#18181B'
                          : isDark
                            ? 'rgba(255,255,255,0.28)'
                            : 'rgba(24,24,27,0.2)',
                    }}
                    onClick={() => setCurrentSlide(idx)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Editorial Spotlight Column */}
          <div className="hero-rail">
            {/* Limited Release Card */}
            <div className="rail-deal-card">
              <div style={{ position: 'relative', zIndex: 2 }}>
                <span className="luxe-rail-eyebrow">LIMITED RELEASE</span>
                <h3 className="rail-deal-title">Studio Acoustic Drop</h3>
                <div className="deal-timer-pills">
                  <div className="timer-unit-box">
                    <div className="timer-unit-val">{String(timeLeft.hrs).padStart(2, '0')}</div>
                    <div className="timer-unit-label">Hrs</div>
                  </div>
                  <span className="timer-separator">:</span>
                  <div className="timer-unit-box">
                    <div className="timer-unit-val">{String(timeLeft.min).padStart(2, '0')}</div>
                    <div className="timer-unit-label">Min</div>
                  </div>
                  <span className="timer-separator">:</span>
                  <div className="timer-unit-box">
                    <div className="timer-unit-val">{String(timeLeft.sec).padStart(2, '0')}</div>
                    <div className="timer-unit-label">Sec</div>
                  </div>
                </div>
              </div>

              <Link href="/product/sony-wh-1000xm5-wireless-headphones" className="btn-grab-now">
                <span>View Release</span>
                <ArrowRight size={13} />
              </Link>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300"
                alt="Featured timepiece and audio release"
                className="rail-deal-img"
              />
            </div>

            {/* Brand Partner Card */}
            <div className="rail-seller-card">
              <div>
                <span className="luxe-rail-eyebrow light">CREATOR COLLECTIVE</span>
                <h3 className="rail-seller-title">Sell on VibeCart</h3>
                <p className="rail-seller-sub">
                  Curated storefronts for independent design houses. 0% launch fee for 30 days.
                </p>
              </div>

              <Link href="/seller/register" className="btn-start-selling">
                <span>Apply as a Seller</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* Minimalist Value Strip */}
        <div className="fk-bank-strip">
          <div className="fk-bank-item">
            <div className="fk-bank-icon-box">
              <CreditCard size={18} strokeWidth={1.6} />
            </div>
            <div>
              <div className="fk-bank-title">10% Card Privilege</div>
              <div className="fk-bank-sub">On leading partner credit &amp; debit cards</div>
            </div>
          </div>

          <div className="fk-bank-item">
            <div className="fk-bank-icon-box">
              <Percent size={18} strokeWidth={1.6} />
            </div>
            <div>
              <div className="fk-bank-title">Welcome Code: WELCOME100</div>
              <div className="fk-bank-sub">Flat ₹100 savings on orders above ₹499</div>
            </div>
          </div>

          <div className="fk-bank-item">
            <div className="fk-bank-icon-box">
              <Truck size={18} strokeWidth={1.6} />
            </div>
            <div>
              <div className="fk-bank-title">Complimentary Express Delivery</div>
              <div className="fk-bank-sub">Insured doorstep dispatch over ₹499</div>
            </div>
          </div>

          <div className="fk-bank-item">
            <div className="fk-bank-icon-box">
              <ShieldCheck size={18} strokeWidth={1.6} />
            </div>
            <div>
              <div className="fk-bank-title">Verified Authenticity</div>
              <div className="fk-bank-sub">Curated brands with 7-day easy returns</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
