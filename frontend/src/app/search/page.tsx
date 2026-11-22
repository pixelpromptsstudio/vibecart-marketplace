import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { SearchCatalogClient } from '@/components/SearchCatalogClient';
import { VibeLoader } from '@/components/VibeLoader';
import { fetchServerCategories } from '@/lib/serverApi';
import { SITE_NAME } from '@/lib/seo';

interface SearchPageProps {
  searchParams: Promise<{ q?: string; search?: string; category?: string; brand?: string; trending?: string }>;
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const sp = await searchParams;
  const query = sp.q || sp.search;
  const title = query
    ? `Search "${query}"`
    : sp.brand
    ? `${sp.brand} Products`
    : sp.trending === 'true'
    ? 'Trending Marketplace Drops'
    : 'Explore Catalog & Filters';

  return {
    title,
    description: `Browse verified tech, fashion, and lifestyle essentials across ${SITE_NAME} with multi-filter search and buyer protection.`,
    alternates: { canonical: '/search' },
  };
}

export default async function SearchPage() {
  const categories = await fetchServerCategories();

  return (
    <Suspense
      fallback={
        <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <VibeLoader label="Loading marketplace search" />
        </div>
      }
    >
      <SearchCatalogClient initialCategories={categories} />
    </Suspense>
  );
}
