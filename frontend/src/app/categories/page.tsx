import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Smartphone,
  Headphones,
  Shirt,
  Armchair,
  Sparkles,
  Trophy,
  BookOpen,
  ShoppingBasket,
  Smile,
  Car,
  ArrowRight,
  Grid,
} from 'lucide-react';
import { fetchServerCategories } from '@/lib/serverApi';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import {
  buildBreadcrumbSchema,
  buildItemListSchema,
  SITE_NAME,
} from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'All Categories — Explore Departments',
  description: `Browse every shopping department on ${SITE_NAME}, including Mobiles, Electronics, Fashion, Home & Living, Beauty, Sports, Books, and more.`,
  alternates: { canonical: '/categories' },
  openGraph: {
    title: `Browse All Categories | ${SITE_NAME}`,
    description: `Discover every curated category on ${SITE_NAME}.`,
    url: '/categories',
  },
};

const iconMap: Record<string, React.ReactNode> = {
  mobiles: <Smartphone size={28} color="#3B82F6" />,
  electronics: <Headphones size={28} color="#4F46E5" />,
  fashion: <Shirt size={28} color="#8B5CF6" />,
  'home-living': <Armchair size={28} color="#059669" />,
  beauty: <Sparkles size={28} color="#DB2777" />,
  sports: <Trophy size={28} color="#16A34A" />,
  books: <BookOpen size={28} color="#0284C7" />,
  grocery: <ShoppingBasket size={28} color="#D97706" />,
  'toys-kids': <Smile size={28} color="#EA580C" />,
  automotive: <Car size={28} color="#0369A1" />,
};

const fallbackCategories = [
  { name: 'Mobiles', slug: 'mobiles', bgColor: '#EFF6FF', description: 'Flagship smartphones, cases & accessories' },
  { name: 'Electronics', slug: 'electronics', bgColor: '#EEF2FF', description: 'Audio, smartwatches, cameras & laptops' },
  { name: 'Fashion', slug: 'fashion', bgColor: '#EDE9FE', description: 'Designer streetwear, sneakers & watches' },
  { name: 'Home & Living', slug: 'home-living', bgColor: '#ECFDF5', description: 'Minimalist furniture, lighting & decor' },
  { name: 'Beauty', slug: 'beauty', bgColor: '#FFF1F2', description: 'Skincare, grooming & signature fragrances' },
  { name: 'Sports', slug: 'sports', bgColor: '#F0FDF4', description: 'Fitness gear, cycle tech & activewear' },
  { name: 'Books', slug: 'books', bgColor: '#F0F9FF', description: 'Bestsellers, design monographs & tech reads' },
  { name: 'Grocery', slug: 'grocery', bgColor: '#FEF3C7', description: 'Artisanal pantry, coffee & organic staples' },
];

export default async function CategoriesPage() {
  const fetched = await fetchServerCategories();
  const categories = fetched.length > 0 ? fetched : fallbackCategories;

  const schemas = [
    buildBreadcrumbSchema([
      { name: 'Home', url: '/' },
      { name: 'Categories', url: '/categories' },
    ]),
    buildItemListSchema(
      'VibeCart Categories',
      categories.map((cat: any) => ({
        name: cat.name,
        url: `/category/${cat.slug}`,
      }))
    ),
  ];

  return (
    <>
      <JsonLd data={schemas} />
      <div className="container" style={{ paddingBlock: '28px 64px' }}>
        <Breadcrumbs items={[{ label: 'Categories' }]} />

        <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#4F46E5', fontSize: '12px', fontWeight: 800, letterSpacing: '0.08em', marginBottom: '6px' }}>
              <Grid size={14} />
              <span>MARKETPLACE DIRECTORY</span>
            </div>
            <h1 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 900, color: '#0F172A' }}>
              Shop by Category
            </h1>
            <p style={{ fontSize: '15px', color: '#64748B', marginTop: '4px' }}>
              Explore curated departments from verified brands and independent sellers.
            </p>
          </div>
          <Link href="/search" className="btn-pill-dark">
            <span>Browse Full Catalog</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="product-catalog-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
          {categories.map((cat: any) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="legal-card"
              style={{
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <div>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: cat.bgColor || '#F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '14px',
                  }}
                >
                  {iconMap[cat.slug] || <Sparkles size={28} color="#4F46E5" />}
                </div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                  {cat.name}
                </h2>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.55 }}>
                  {cat.description || `Explore curated ${cat.name} essentials & top-rated deals.`}
                </p>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 700, color: '#4F46E5' }}>
                <span>Shop {cat.name}</span>
                <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
