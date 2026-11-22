import { cache } from 'react';

/**
 * Server-side data fetching utilities for Next.js Server Components & Metadata.
 * Wrapped in React `cache()` so `generateMetadata` and `Page` deduplicate requests
 * automatically per render pass, and safely fail open with null/empty fallbacks if
 * the backend is offline during static build or cold start.
 */

function resolveServerApiBase(): string {
  const configured =
    process.env.API_INTERNAL_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://127.0.0.1:5000/api';
  const clean = configured.replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

async function serverGet<T>(
  path: string,
  revalidate = 60
): Promise<T | null> {
  const base = resolveServerApiBase();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  try {
    const res = await fetch(`${base}${normalizedPath}`, {
      next: { revalidate },
      signal: AbortSignal.timeout(3500),
      headers: {
        Accept: 'application/json',
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const fetchServerTrendingProducts = cache(async () => {
  const data = await serverGet<{ products?: any[] }>('/products/trending', 60);
  return data?.products ?? [];
});

export const fetchServerDealsProducts = cache(async () => {
  const data = await serverGet<{ products?: any[] }>('/products/deals', 60);
  return data?.products ?? [];
});

export const fetchServerProducts = cache(async (queryString = '') => {
  const qs = queryString ? (queryString.startsWith('?') ? queryString : `?${queryString}`) : '';
  return await serverGet<{
    products?: any[];
    pagination?: { page: number; limit: number; total: number; totalPages: number };
  }>(`/products${qs}`, 45);
});

export const fetchServerProductBySlug = cache(async (slug: string) => {
  return await serverGet<{
    product?: any;
    reviews?: any[];
    relatedProducts?: any[];
  }>(`/products/${encodeURIComponent(slug)}`, 60);
});

export const fetchServerCategories = cache(async () => {
  const data = await serverGet<{ categories?: any[] }>('/categories', 120);
  return data?.categories ?? [];
});

export const fetchServerCategoryBySlug = cache(async (slug: string) => {
  return await serverGet<{ category?: any; products?: any[] }>(
    `/categories/${encodeURIComponent(slug)}`,
    60
  );
});

export const fetchServerBrands = cache(async () => {
  const data = await serverGet<{ brands?: any[] }>('/brands', 120);
  return data?.brands ?? [];
});

export const fetchServerReels = cache(async () => {
  const data = await serverGet<{ reels?: any[] }>('/reels', 60);
  return data?.reels ?? [];
});

export const fetchServerBanners = cache(async (position?: string) => {
  const qs = position ? `?position=${encodeURIComponent(position)}` : '';
  const data = await serverGet<{ banners?: any[] }>(`/banners${qs}`, 120);
  return data?.banners ?? [];
});

export const fetchAllCatalogSlugsForSitemap = cache(async () => {
  const [categories, firstPage] = await Promise.all([
    fetchServerCategories(),
    fetchServerProducts('limit=100&page=1'),
  ]);

  const products: any[] = [...(firstPage?.products ?? [])];
  const totalPages = firstPage?.pagination?.totalPages ?? 1;

  if (totalPages > 1) {
    const extraPages = Math.min(totalPages, 5);
    const rest = await Promise.all(
      Array.from({ length: extraPages - 1 }, (_, i) =>
        fetchServerProducts(`limit=100&page=${i + 2}`)
      )
    );
    for (const p of rest) {
      if (p?.products) products.push(...p.products);
    }
  }

  return { categories, products };
});
