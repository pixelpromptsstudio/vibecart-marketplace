'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/Header';
import { CategoryNav } from '@/components/CategoryNav';
import { TrustBadges } from '@/components/TrustBadges';
import { Footer } from '@/components/Footer';
import { FloatingVibeDock } from '@/components/FloatingVibeDock';
import { MobileBottomNav } from '@/components/MobileBottomNav';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname() || '';
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <div className="admin-root-shell">
        <main id="main-content" className="admin-root-main">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Header />
      <CategoryNav />
      <main id="main-content" style={{ flex: 1 }}>
        {children}
      </main>
      <TrustBadges />
      <Footer />
      <FloatingVibeDock />
      <MobileBottomNav />
    </div>
  );
};
