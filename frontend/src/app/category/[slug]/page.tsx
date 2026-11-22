import type { Metadata } from 'next';
import { CategoryProductsClient } from '@/components/CategoryProductsClient';
import { JsonLd } from '@/components/JsonLd';
import { fetchServerCategoryBySlug } from '@/lib/serverApi';
import {
  buildBreadcrumbSchema,
  buildItemListSchema,
  SITE_NAME,
} from '@/lib/seo';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await fetchServerCategoryBySlug(slug);
  const category = data?.category;

  const fallbackName = slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const catName = category?.name || fallbackName;
  const description =
    category?.description ||
    `Shop curated ${catName} from verified independent sellers and top brands on ${SITE_NAME}. Enjoy buyer protection and fast delivery.`;

  return {
    title: `${catName} — Shop Curated Collection`,
    description,
    alternates: { canonical: `/category/${slug}` },
    openGraph: {
      title: `${catName} Collection | ${SITE_NAME}`,
      description,
      url: `/category/${slug}`,
      images: ['/opengraph-image'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${catName} Collection | ${SITE_NAME}`,
      description,
    },
  };
}

export default async function CategoryDetailPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const data = await fetchServerCategoryBySlug(slug);
  const category = data?.category ?? null;
  const products = data?.products ?? [];

  const schemas: Record<string, any>[] = [
    buildBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Categories', url: '/categories' },
      { name: category?.name || slug, url: `/category/${slug}` },
    ]),
  ];

  if (products.length > 0) {
    schemas.push(
      buildItemListSchema(
        `${category?.name || slug} Products`,
        products.slice(0, 12).map((p: any) => ({
          name: p.name,
          url: `/product/${p.slug}`,
          image: p.images?.[0],
        }))
      )
    );
  }

  return (
    <>
      <JsonLd data={schemas} />
      <CategoryProductsClient
        slug={slug}
        initialCategory={category}
        initialProducts={products}
      />
    </>
  );
}
