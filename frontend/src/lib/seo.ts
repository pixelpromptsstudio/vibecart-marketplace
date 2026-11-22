/**
 * Centralized SEO constants, metadata helpers, and Schema.org JSON-LD builders.
 */

export const SITE_NAME = 'VibeCart';
export const SITE_TAGLINE = 'Shop the Vibe. Sell Your Style.';
export const SITE_DESCRIPTION =
  'Discover curated tech, luxury essentials, statement fashion, and shoppable Vibe Reels on VibeCart — the modern multi-vendor marketplace with verified sellers and buyer protection.';

export const DEFAULT_KEYWORDS = [
  'VibeCart',
  'multi-vendor marketplace',
  'online shopping India',
  'shoppable reels',
  'tech electronics',
  'luxury fashion',
  'home and living',
  'verified sellers',
];

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    'http://localhost:3000';
  return raw.replace(/\/+$/, '');
}

export function absoluteUrl(path = '/'): string {
  const base = getSiteUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath === '/' ? '' : normalizedPath}`;
}

/**
 * Safely serialize JSON-LD for script injection inside Next.js Server Components
 * (escapes `<` to avoid HTML/script injection issues).
 */
export function safeJsonLd(payload: unknown): string {
  return JSON.stringify(payload).replace(/</g, '\\u003c');
}

export function buildOrganizationSchema() {
  const url = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url,
    description: SITE_DESCRIPTION,
    logo: `${url}/icon`,
    sameAs: [url],
  };
}

export function buildWebSiteSchema() {
  const url = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: `${SITE_NAME} Marketplace`,
    url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export interface BreadcrumbCrumb {
  name: string;
  url: string;
}

export function buildBreadcrumbSchema(items: BreadcrumbCrumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : absoluteUrl(item.url),
    })),
  };
}

export function buildProductSchema(product: {
  name: string;
  slug: string;
  description?: string;
  brand?: string;
  sku?: string;
  price: number;
  originalPrice?: number;
  stock?: number;
  images?: string[];
  rating?: number;
  reviewCount?: number;
  sellerId?: { storeName?: string };
  category?: { name?: string };
}) {
  const productUrl = absoluteUrl(`/product/${product.slug}`);
  const inStock = (product.stock ?? 1) > 0;
  const priceValidUntil = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description:
      product.description ||
      `${product.name} by ${product.brand || SITE_NAME} available on ${SITE_NAME}.`,
    image:
      product.images && product.images.length > 0
        ? product.images
        : [absoluteUrl('/opengraph-image')],
    url: productUrl,
    sku: product.sku || product.slug,
    category: product.category?.name || 'Marketplace Goods',
    brand: {
      '@type': 'Brand',
      name: product.brand || SITE_NAME,
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'INR',
      price: Number(product.price).toFixed(2),
      priceValidUntil,
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: product.sellerId?.storeName || `${SITE_NAME} Verified Seller`,
      },
    },
  };

  if (product.rating && (product.reviewCount ?? 0) > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(product.rating).toFixed(1),
      reviewCount: product.reviewCount,
      bestRating: '5',
      worstRating: '1',
    };
  }

  return schema;
}

export function buildItemListSchema(
  name: string,
  items: Array<{ name: string; url: string; image?: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url.startsWith('http') ? item.url : absoluteUrl(item.url),
      ...(item.image ? { image: item.image } : {}),
    })),
  };
}
