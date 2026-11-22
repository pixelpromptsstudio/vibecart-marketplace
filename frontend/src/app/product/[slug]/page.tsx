import type { Metadata } from 'next';
import { ProductDetailClient } from '@/components/ProductDetailClient';
import { JsonLd } from '@/components/JsonLd';
import { fetchServerProductBySlug } from '@/lib/serverApi';
import {
  buildBreadcrumbSchema,
  buildProductSchema,
  SITE_NAME,
} from '@/lib/seo';
import { truncateText } from '@/lib/format';

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchServerProductBySlug(slug);
  const product = data?.product;

  if (!product) {
    return {
      title: 'Product Details',
      description: `Explore curated tech, fashion, and lifestyle essentials on ${SITE_NAME}.`,
      alternates: { canonical: `/product/${slug}` },
    };
  }

  const priceStr = `₹${Math.round(product.price).toLocaleString('en-IN')}`;
  const title = `${product.name} — ${product.brand || SITE_NAME} (${priceStr})`;
  const description = truncateText(
    product.description ||
      `Buy ${product.name} by ${product.brand} for ${priceStr} on ${SITE_NAME} with buyer protection and fast delivery.`,
    160
  );
  const ogImages =
    product.images && product.images.length > 0
      ? [{ url: product.images[0], width: 1200, height: 1200, alt: product.name }]
      : ['/opengraph-image'];

  return {
    title,
    description,
    keywords: [product.name, product.brand, product.category?.name, SITE_NAME].filter(Boolean),
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: 'website',
      title,
      description,
      url: `/product/${product.slug}`,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.images?.[0] ? [product.images[0]] : ['/opengraph-image'],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const data = await fetchServerProductBySlug(slug);
  const product = data?.product ?? null;

  const schemas = product
    ? [
        buildProductSchema(product),
        buildBreadcrumbSchema([
          { name: 'Home', url: '/' },
          ...(product.category?.name
            ? [
                {
                  name: product.category.name,
                  url: `/category/${product.category.slug}`,
                },
              ]
            : []),
          { name: product.name, url: `/product/${product.slug}` },
        ]),
      ]
    : null;

  return (
    <>
      {schemas && <JsonLd data={schemas} />}
      <ProductDetailClient
        slug={slug}
        initialProduct={product}
        initialReviews={data?.reviews ?? []}
        initialRelatedProducts={data?.relatedProducts ?? []}
      />
    </>
  );
}
