'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { HeroSection } from '@/components/HeroSection';
import { DealsRailSection, DealProduct } from '@/components/DealsRailSection';
import { LuckyCouponBox } from '@/components/LuckyCouponBox';
import { VibeReelsSection } from '@/components/VibeReelsSection';
import { TopBrandsSection, BrandItem } from '@/components/TopBrandsSection';
import { PromoBannersSection } from '@/components/PromoBannersSection';
import { CategoryGrid } from '@/components/CategoryGrid';
import { productApi, brandApi, reelApi } from '@/lib/api';

interface HomePageClientProps {
  initialTrending: DealProduct[];
  initialDeals: DealProduct[];
  initialBrands: BrandItem[];
  initialReels: any[];
  initialCategories: any[];
}

export function HomePageClient({
  initialTrending,
  initialDeals,
  initialBrands,
  initialReels,
  initialCategories,
}: HomePageClientProps) {
  const initialMergedProducts = useMemo(() => {
    const map = new Map<string, DealProduct>();
    for (const p of [...initialDeals, ...initialTrending]) {
      if (p?._id && !map.has(p._id)) {
        map.set(p._id, p);
      }
    }
    return Array.from(map.values());
  }, [initialDeals, initialTrending]);

  const [products, setProducts] = useState<DealProduct[]>(initialMergedProducts);
  const [brands, setBrands] = useState<BrandItem[]>(initialBrands);
  const [reels, setReels] = useState<any[]>(initialReels);

  useEffect(() => {
    // Only hydrate on client if SSR returned empty (e.g. build without live backend)
    if (products.length > 0 && brands.length > 0 && reels.length > 0) return;

    const fetchData = async () => {
      try {
        const [trendRes, dealsRes, brandsRes, reelsRes] = await Promise.all([
          products.length === 0 ? productApi.getTrending().catch(() => ({ products: [] })) : null,
          products.length === 0 ? productApi.getDeals().catch(() => ({ products: [] })) : null,
          brands.length === 0 ? brandApi.getBrands().catch(() => ({ brands: [] })) : null,
          reels.length === 0 ? reelApi.getReels().catch(() => ({ reels: [] })) : null,
        ]);

        if (products.length === 0) {
          const map = new Map<string, DealProduct>();
          for (const p of [...(dealsRes?.products ?? []), ...(trendRes?.products ?? [])]) {
            if (p?._id && !map.has(p._id)) map.set(p._id, p);
          }
          if (map.size > 0) setProducts(Array.from(map.values()));
        }
        if (brandsRes?.brands && brandsRes.brands.length > 0) setBrands(brandsRes.brands);
        if (reelsRes?.reels && reelsRes.reels.length > 0) setReels(reelsRes.reels);
      } catch (err) {
        console.error('Failed to hydrate homepage data:', err);
      }
    };

    fetchData();
  }, [products.length, brands.length, reels.length]);

  return (
    <div className="luxe-home-stack">
      <h1 className="sr-only" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>
        VibeCart — Curated Multi-Vendor Marketplace for Tech, Fashion &amp; Shoppable Video Reels
      </h1>

      {/* 1. Editorial Hero Gallery */}
      <HeroSection />

      <div className="container luxe-sections-col">
        {/* 2. Curated Collections */}
        {initialCategories.length > 0 && <CategoryGrid categories={initialCategories} />}

        {/* 3. Member Privilege Voucher */}
        <LuckyCouponBox />

        {/* 4. Curated Product Edits & Category Showcases */}
        <DealsRailSection products={products} />

        {/* 5. Dark Motion Lookbook: Vibe Reels */}
        <VibeReelsSection reels={reels} />

        {/* 6. Featured Partner Houses */}
        <TopBrandsSection brands={brands} />

        {/* 7. Editorial Collection Cards */}
        <PromoBannersSection />
      </div>
    </div>
  );
}
