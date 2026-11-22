import React from 'react';
import { HomePageClient } from '@/components/HomePageClient';
import {
  fetchServerTrendingProducts,
  fetchServerDealsProducts,
  fetchServerBrands,
  fetchServerReels,
  fetchServerCategories,
} from '@/lib/serverApi';
import { JsonLd } from '@/components/JsonLd';
import { buildItemListSchema } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [trendingProducts, dealsProducts, brands, reels, categories] =
    await Promise.all([
      fetchServerTrendingProducts(),
      fetchServerDealsProducts(),
      fetchServerBrands(),
      fetchServerReels(),
      fetchServerCategories(),
    ]);

  const featuredList = [...dealsProducts, ...trendingProducts].slice(0, 12);
  const itemListSchema =
    featuredList.length > 0
      ? buildItemListSchema(
          'VibeCart Featured & Trending Products',
          featuredList.map((p: any) => ({
            name: p.name,
            url: `/product/${p.slug}`,
            image: p.images?.[0],
          }))
        )
      : null;

  return (
    <>
      {itemListSchema && <JsonLd data={itemListSchema} />}
      <HomePageClient
        initialTrending={trendingProducts}
        initialDeals={dealsProducts}
        initialBrands={brands}
        initialReels={reels}
        initialCategories={categories}
      />
    </>
  );
}
