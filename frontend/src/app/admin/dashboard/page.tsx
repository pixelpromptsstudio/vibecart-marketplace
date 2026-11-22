'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  XCircle,
  Store,
  AlertTriangle,
  ArrowUpRight,
  PackageCheck,
  Users,
  Tag,
  FileText,
} from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import {
  formatCurrency,
  formatShortDate,
  getOrderStatusStyle,
  isAdminRole,
} from '@/components/admin/adminHelpers';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { VibeLoader } from '@/components/VibeLoader';

export default function AdminDashboardOverviewPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAnalytics();
      setAnalytics(res);
    } catch {
      // Handled gracefully
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && isAdminRole(user.role)) {
      loadAnalytics();
    }
  }, [user, loadAnalytics]);

  const metrics = analytics?.metrics || {};
  const recentOrders = analytics?.recentOrders || [];
  const topProducts = analytics?.topProducts || [];

  const kpiCards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(metrics.totalRevenue),
      icon: DollarSign,
      color: '#10B981',
      bg: '#ECFDF5',
      href: '/admin/orders',
    },
    {
      label: 'Total Orders',
      value: metrics.totalOrders ?? 0,
      icon: ShoppingBag,
      color: '#2563EB',
      bg: '#EFF6FF',
      href: '/admin/orders',
    },
    {
      label: 'Active Fulfillment',
      value: metrics.pendingOrders ?? 0,
      icon: Clock,
      color: '#D97706',
      bg: '#FFFBEB',
      href: '/admin/orders?status=PENDING',
    },
    {
      label: 'Cancelled Orders',
      value: metrics.cancelledOrders ?? 0,
      icon: XCircle,
      color: '#DC2626',
      bg: '#FEF2F2',
      href: '/admin/orders?status=CANCELLED',
    },
    {
      label: 'Pending Sellers',
      value: metrics.pendingSellers ?? 0,
      icon: Store,
      color: '#7C3AED',
      bg: '#F5F3FF',
      href: '/admin/sellers?status=PENDING',
    },
    {
      label: 'Low Stock Alerts',
      value: metrics.lowStockProducts ?? 0,
      icon: AlertTriangle,
      color: '#EA580C',
      bg: '#FFF7ED',
      href: '/admin/products',
    },
  ];

  const quickLinks = [
    {
      href: '/admin/orders',
      title: 'Manage All Orders',
      desc: 'Inspect order timelines, track customer shipments & advance statuses.',
      icon: ShoppingBag,
      accent: '#2563EB',
    },
    {
      href: '/admin/products',
      title: 'Catalog & Moderation',
      desc: 'Approve listings, feature deals & manage low-stock SKUs.',
      icon: PackageCheck,
      accent: '#0D9488',
    },
    {
      href: '/admin/sellers',
      title: 'Seller Onboarding',
      desc: 'Verify vendor applications or suspend non-compliant stores.',
      icon: Store,
      accent: '#7C3AED',
    },
    {
      href: '/admin/promotions',
      title: 'Coupons & Banners',
      desc: 'Publish promo codes, hero campaigns & storefront categories.',
      icon: Tag,
      accent: '#D97706',
    },
    {
      href: '/admin/users',
      title: 'Users & RBAC Roles',
      desc: 'Search platform accounts and manage role assignments.',
      icon: Users,
      accent: '#4F46E5',
    },
    {
      href: '/admin/logs',
      title: 'Audit Trail',
      desc: 'Review chronological security & administrative audit events.',
      icon: FileText,
      accent: '#475569',
    },
  ];

  return (
    <AdminShell
      title="Operations Overview"
      subtitle="Live revenue telemetry, order queue health & workspace shortcuts"
      actions={
        <Link href="/admin/orders" className="admin-primary-btn" style={{ textDecoration: 'none' }}>
          <ShoppingBag size={15} />
          <span>Manage Orders</span>
        </Link>
      }
    >
      {loading && !analytics ? (
        <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
          <VibeLoader label="Loading Operations Telemetry..." size="lg" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* KPI Grid */}
          <section className="admin-kpi-grid" aria-label="Key performance metrics">
            {kpiCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.label} href={card.href} className="admin-kpi-card">
                  <div className="admin-kpi-top">
                    <span className="admin-kpi-label">{card.label}</span>
                    <div className="admin-kpi-icon" style={{ background: card.bg, color: card.color }}>
                      <Icon size={18} />
                    </div>
                  </div>
                  <div className="admin-kpi-value">{card.value}</div>
                </Link>
              );
            })}
          </section>

          {/* Quick Module Links */}
          <section className="admin-quick-grid" aria-label="Admin modules">
            {quickLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="admin-quick-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      className="admin-kpi-icon"
                      style={{ background: '#F8FAFC', color: item.accent, border: '1px solid #E2E8F0' }}
                    >
                      <Icon size={18} />
                    </span>
                    <ArrowUpRight size={16} color="#94A3B8" />
                  </div>
                  <div className="admin-quick-title">{item.title}</div>
                  <div className="admin-quick-desc">{item.desc}</div>
                </Link>
              );
            })}
          </section>

          {/* Recent Orders + Top Products Split */}
          <div className="admin-split-grid">
            <section className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h2 className="admin-card-title">Recent Platform Orders</h2>
                  <p className="admin-card-sub">
                    Latest checkouts across all sellers ({metrics.deliveredOrders ?? 0} delivered total)
                  </p>
                </div>
                <Link href="/admin/orders" className="admin-link-btn">
                  View All Orders →
                </Link>
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="admin-empty-cell">
                          No orders placed yet.
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((ord: any) => {
                        const badge = getOrderStatusStyle(ord.status);
                        return (
                          <tr key={ord._id}>
                            <td style={{ fontWeight: 700, color: '#0F172A' }}>{ord.orderNumber}</td>
                            <td>
                              <div style={{ fontWeight: 600 }}>
                                {ord.customerId?.name || ord.shippingAddress?.fullName || 'Customer'}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748B' }}>
                                {ord.customerId?.email || ord.shippingAddress?.city || ''}
                              </div>
                            </td>
                            <td style={{ color: '#64748B', fontSize: '13px' }}>
                              {formatShortDate(ord.createdAt)}
                            </td>
                            <td style={{ fontWeight: 700 }}>{formatCurrency(ord.totalAmount)}</td>
                            <td>
                              <span
                                className="admin-status-pill"
                                style={{
                                  background: badge.bg,
                                  color: badge.color,
                                  borderColor: badge.border,
                                }}
                              >
                                {ord.status}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <Link
                                href={`/admin/orders?search=${encodeURIComponent(ord.orderNumber)}`}
                                className="admin-btn-outline-sm"
                              >
                                Manage
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h2 className="admin-card-title">Top Rated Products</h2>
                  <p className="admin-card-sub">
                    {metrics.totalProducts ?? 0} active listings platform-wide
                  </p>
                </div>
                <Link href="/admin/products" className="admin-link-btn">
                  Moderate →
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {topProducts.length === 0 ? (
                  <div className="admin-empty-cell">No products found.</div>
                ) : (
                  topProducts.map((p: any) => (
                    <div key={p._id} className="admin-mini-row">
                      <img
                        src={p.images?.[0] || '/placeholder.png'}
                        alt={p.name}
                        className="admin-thumb"
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <Link
                          href={`/product/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="admin-mini-title"
                        >
                          {p.name}
                        </Link>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>
                          {formatCurrency(p.price)} • {p.reviewCount || 0} reviews
                        </div>
                      </div>
                      <span
                        className="admin-status-pill"
                        style={{
                          background: p.stock <= 5 ? '#FEE2E2' : '#ECFDF5',
                          color: p.stock <= 5 ? '#991B1B' : '#065F46',
                        }}
                      >
                        Stock: {p.stock}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
