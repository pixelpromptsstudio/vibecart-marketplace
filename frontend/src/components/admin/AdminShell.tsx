'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  PackageCheck,
  Store,
  Users,
  Tag,
  FileText,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { VibeLoader } from '@/components/VibeLoader';
import { isAdminRole } from './adminHelpers';

interface AdminShellProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Manage Orders', icon: ShoppingBag },
  { href: '/admin/products', label: 'Products & Moderation', icon: PackageCheck },
  { href: '/admin/sellers', label: 'Sellers', icon: Store },
  { href: '/admin/users', label: 'Users & Roles', icon: Users },
  { href: '/admin/promotions', label: 'Coupons & Banners', icon: Tag },
  { href: '/admin/logs', label: 'Audit Logs', icon: FileText },
];

export const AdminShell: React.FC<AdminShellProps> = ({
  title,
  subtitle,
  actions,
  children,
}) => {
  const pathname = usePathname() || '';
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen]);

  if (isLoading) {
    return (
      <div className="admin-auth-wall">
        <VibeLoader label="Verifying Admin Session..." size="lg" />
      </div>
    );
  }

  if (!user || !isAdminRole(user.role)) {
    return (
      <div className="admin-auth-wall">
        <div className="admin-guard-card">
          <div className="admin-guard-icon">
            <ShieldAlert size={30} color="#EF4444" />
          </div>
          <h1 className="admin-guard-title">Admin Access Required</h1>
          <p className="admin-guard-desc">
            {user
              ? `Signed in as ${user.email} (${user.role}). Only Admin, Manager, or Super Admin accounts may open the VibeCart Command Console.`
              : 'Please sign in via the dedicated VibeCart Admin Portal to manage orders, catalog moderation, sellers, and promotions.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            <Link href="/admin" className="btn-pill-dark" style={{ justifyContent: 'center', width: '100%' }}>
              Sign In to Admin Portal
            </Link>
            <Link
              href="/"
              className="btn-pill-outline"
              style={{ justifyContent: 'center', width: '100%', textDecoration: 'none' }}
            >
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSignOut = () => {
    logout();
    router.push('/admin');
  };

  const renderSidebarNav = () => (
    <>
      <div className="admin-brand">
        <Link href="/admin/dashboard" className="admin-brand-link">
          <div className="admin-brand-mark">
            <ShieldCheck size={20} color="#FFFFFF" />
          </div>
          <div>
            <div className="admin-brand-title">VibeCart</div>
            <div className="admin-brand-sub">Admin Console</div>
          </div>
        </Link>
        <button
          type="button"
          className="admin-drawer-close"
          aria-label="Close admin navigation"
          onClick={() => setMobileOpen(false)}
        >
          <X size={18} />
        </button>
      </div>

      <nav className="admin-nav" aria-label="Admin sections">
        <div className="admin-nav-section-label">OPERATIONS</div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-nav-link ${active ? 'active' : ''}`}
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="admin-user-chip">
          <div className="admin-user-avatar">
            {user.name?.slice(0, 1).toUpperCase() || 'A'}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="admin-user-name">{user.name}</div>
            <div className="admin-user-role">{user.role}</div>
          </div>
        </div>

        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-footer-btn"
        >
          <ExternalLink size={15} />
          <span>View Storefront</span>
        </Link>

        <button
          type="button"
          onClick={handleSignOut}
          className="admin-footer-btn danger"
        >
          <LogOut size={15} />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="admin-layout">
      {/* Desktop Persistent Sidebar */}
      <aside className="admin-sidebar">{renderSidebarNav()}</aside>

      {/* Mobile Slide-over Drawer */}
      {mobileOpen && (
        <div className="admin-drawer-backdrop" onClick={() => setMobileOpen(false)}>
          <aside
            className="admin-drawer"
            aria-label="Mobile admin menu"
            onClick={(e) => e.stopPropagation()}
          >
            {renderSidebarNav()}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="admin-workspace">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              type="button"
              className="admin-menu-btn"
              aria-label="Open admin navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div style={{ minWidth: 0 }}>
              <h1 className="admin-topbar-title">{title}</h1>
              {subtitle && <p className="admin-topbar-subtitle">{subtitle}</p>}
            </div>
          </div>

          <div className="admin-topbar-right">
            {actions}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-storefront-pill"
            >
              <span>View Storefront</span>
              <ExternalLink size={13} />
            </Link>
            <span className="admin-role-badge">{user.role}</span>
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
};
