'use client';

import React from 'react';
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
  LayoutGrid,
} from 'lucide-react';

interface CategoryItem {
  name: string;
  slug: string;
  bgColor?: string;
  iconName?: string;
}

const iconMap: Record<string, React.ReactNode> = {
  mobiles: <Smartphone size={20} strokeWidth={1.6} />,
  electronics: <Headphones size={20} strokeWidth={1.6} />,
  fashion: <Shirt size={20} strokeWidth={1.6} />,
  'home-living': <Armchair size={20} strokeWidth={1.6} />,
  beauty: <Sparkles size={20} strokeWidth={1.6} />,
  sports: <Trophy size={20} strokeWidth={1.6} />,
  books: <BookOpen size={20} strokeWidth={1.6} />,
  grocery: <ShoppingBasket size={20} strokeWidth={1.6} />,
  'toys-kids': <Smile size={20} strokeWidth={1.6} />,
  automotive: <Car size={20} strokeWidth={1.6} />,
};

const defaultItems: CategoryItem[] = [
  { name: 'Mobiles', slug: 'mobiles' },
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Fashion', slug: 'fashion' },
  { name: 'Home & Living', slug: 'home-living' },
  { name: 'Beauty', slug: 'beauty' },
  { name: 'Sports', slug: 'sports' },
  { name: 'Books', slug: 'books' },
  { name: 'Grocery', slug: 'grocery' },
  { name: 'Toys & Kids', slug: 'toys-kids' },
  { name: 'Automotive', slug: 'automotive' },
];

export const CategoryGrid: React.FC<{ categories?: CategoryItem[] }> = ({
  categories = defaultItems,
}) => {
  const displayCats = categories.length > 0 ? categories : defaultItems;

  return (
    <section className="section-wrap">
      <div className="section-header">
        <div>
          <span className="luxe-section-kicker">DEPARTMENTS</span>
          <h2 className="section-title">Shop by Collection</h2>
        </div>
        <Link href="/categories" className="section-view-all">
          <span>All Departments</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="category-grid">
        {displayCats.map((cat) => {
          const icon = iconMap[cat.slug] || <Sparkles size={20} strokeWidth={1.6} />;
          return (
            <Link key={cat.slug} href={`/category/${cat.slug}`} className="category-card">
              <div className="category-icon-box">{icon}</div>
              <span className="category-name">{cat.name}</span>
            </Link>
          );
        })}

        <Link href="/categories" className="category-card">
          <div className="category-icon-box">
            <LayoutGrid size={20} strokeWidth={1.6} />
          </div>
          <span className="category-name">Explore All</span>
        </Link>
      </div>
    </section>
  );
};
