import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/seo';
import { fetchAllCatalogSlugsForSitemap } from '@/lib/serverApi';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: absoluteUrl('/categories'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: absoluteUrl('/search'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: absoluteUrl('/reels'),
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: absoluteUrl('/seller'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: absoluteUrl('/trust'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: absoluteUrl('/privacy'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: absoluteUrl('/terms'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const { categories, products } = await fetchAllCatalogSlugsForSitemap();

  const categoryEntries: MetadataRoute.Sitemap = categories
    .filter((c) => c?.slug)
    .map((cat) => ({
      url: absoluteUrl(`/category/${cat.slug}`),
      lastModified: cat.updatedAt ? new Date(cat.updatedAt) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }));

  const productEntries: MetadataRoute.Sitemap = products
    .filter((p) => p?.slug)
    .map((prod) => ({
      url: absoluteUrl(`/product/${prod.slug}`),
      lastModified: prod.updatedAt ? new Date(prod.updatedAt) : now,
      changeFrequency: 'daily' as const,
      priority: prod.featured || prod.trending ? 0.9 : 0.8,
      ...(prod.images && prod.images.length > 0 ? { images: [prod.images[0]] } : {}),
    }));

  return [...staticRoutes, ...categoryEntries, ...productEntries];
}
