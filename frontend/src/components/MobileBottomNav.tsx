'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Grid, Home, ShoppingBag, User, Video } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { cartCount } = useAuth();

  const items = [
    {
      href: '/',
      label: 'Home',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      href: '/categories',
      label: 'Categories',
      icon: Grid,
      isActive: pathname.startsWith('/categor'),
    },
    {
      href: '/reels',
      label: 'Reels',
      icon: Video,
      isActive: pathname.startsWith('/reels'),
    },
    {
      href: '/cart',
      label: 'Cart',
      icon: ShoppingBag,
      badge: cartCount > 0 ? cartCount : undefined,
      isActive: pathname.startsWith('/cart') || pathname.startsWith('/checkout'),
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: User,
      isActive: pathname.startsWith('/profile') || pathname.startsWith('/orders'),
    },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-nav-item ${item.isActive ? 'active' : ''}`}
            aria-current={item.isActive ? 'page' : undefined}
          >
            <span className="mobile-nav-icon-wrap">
              <Icon size={20} strokeWidth={item.isActive ? 2.4 : 2} />
              {item.badge !== undefined && (
                <span className="mobile-nav-badge">{item.badge > 99 ? '99+' : item.badge}</span>
              )}
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
