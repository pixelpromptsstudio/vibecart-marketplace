import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/product/', '/category/', '/categories', '/search', '/reels', '/privacy', '/terms', '/trust'],
        disallow: [
          '/api/',
          '/admin',
          '/admin/',
          '/seller/dashboard',
          '/cart',
          '/checkout',
          '/orders',
          '/orders/',
          '/profile',
          '/wishlist',
          '/login',
          '/signup',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
