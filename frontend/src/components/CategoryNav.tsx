'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';

interface CategoryNavProps {
  categories?: { name: string; slug: string }[];
}

const navLinks = [
  { name: 'Curated Edits', href: '/search?trending=true' },
  { name: 'Mobiles', href: '/category/mobiles' },
  { name: 'Electronics', href: '/category/electronics' },
  { name: 'Fashion', href: '/category/fashion' },
  { name: 'Home & Living', href: '/category/home-living' },
  { name: 'Beauty', href: '/category/beauty' },
  { name: 'Sports', href: '/category/sports' },
  { name: 'Grocery', href: '/category/grocery' },
  { name: 'Vibe Reels', href: '/reels', isAccent: true },
];

export const CategoryNav: React.FC<CategoryNavProps> = () => {
  const pathname = usePathname() || '';

  return (
    <nav className="fk-category-bar" aria-label="Primary departments">
      <div className="container">
        <div className="luxe-catnav-row">
          <div className="fk-category-scroll">
            {navLinks.map((item) => {
              const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`luxe-catnav-pill ${active ? 'active' : ''} ${item.isAccent ? 'reel' : ''}`}
                >
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <Link href="/seller/register" className="sell-on-vibe-btn">
            <span>Partner with Us</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </nav>
  );
};
