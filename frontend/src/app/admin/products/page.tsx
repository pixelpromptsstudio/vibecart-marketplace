'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  CheckCircle2,
  XCircle,
  Star,
  Flame,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import {
  formatCurrency,
  getApprovalStatusStyle,
  isAdminRole,
  isFullAdminRole,
} from '@/components/admin/adminHelpers';
import { adminApi, categoryApi, productApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { VibeLoader } from '@/components/VibeLoader';

export default function AdminProductsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [approvalFilter, setApprovalFilter] = useState('ALL');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canDelete = isFullAdminRole(user?.role);

  useEffect(() => {
    categoryApi
      .getCategories()
      .then((res) => setCategories(res?.categories || []))
      .catch(() => {});
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminApi.getProducts({
        search: activeSearch,
        category: categoryFilter,
        approvalStatus: approvalFilter,
        active: activeFilter === 'ALL' ? '' : activeFilter,
        page,
        limit: 15,
      });
      setProducts(res?.products || []);
      if (res?.pagination) setPagination(res.pagination);
    } catch (err: any) {
      showToast('error', 'Failed to load products', err.message);
    } finally {
      setLoading(false);
    }
  }, [activeSearch, categoryFilter, approvalFilter, activeFilter, page, showToast]);

  useEffect(() => {
    if (user && isAdminRole(user.role)) {
      loadProducts();
    }
  }, [user, loadProducts]);

  const handleModerate = async (productId: string, payload: Record<string, any>, label: string) => {
    try {
      await adminApi.moderateProduct(productId, payload);
      showToast('success', 'Catalog Updated', label);
      await loadProducts();
    } catch (err: any) {
      showToast('error', 'Moderation Failed', err.message);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await productApi.deleteProduct(deleteTarget._id);
      showToast('success', 'Product Deleted', `"${deleteTarget.name}" removed from catalog.`);
      setDeleteTarget(null);
      await loadProducts();
    } catch (err: any) {
      showToast('error', 'Delete Failed', err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminShell
      title="Products & Moderation"
      subtitle="Approve vendor listings, highlight featured/trending deals & control active inventory"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Filter Bar */}
        <div className="admin-toolbar-card">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setActiveSearch(searchInput.trim());
            }}
            className="admin-search-form"
          >
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by product title, brand, or SKU..."
                aria-label="Search products"
                className="admin-form-input with-icon"
              />
              <Search size={16} color="#94A3B8" className="admin-input-icon" />
            </div>

            <select
              aria-label="Filter by category"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="admin-select-compact"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              aria-label="Filter by approval status"
              value={approvalFilter}
              onChange={(e) => {
                setApprovalFilter(e.target.value);
                setPage(1);
              }}
              className="admin-select-compact"
            >
              <option value="ALL">All Approvals</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending Review</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              aria-label="Filter by visibility"
              value={activeFilter}
              onChange={(e) => {
                setActiveFilter(e.target.value);
                setPage(1);
              }}
              className="admin-select-compact"
            >
              <option value="ALL">All Visibility</option>
              <option value="true">Active Live</option>
              <option value="false">Paused / Hidden</option>
            </select>

            <button type="submit" className="admin-primary-btn">
              Apply
            </button>
          </form>
        </div>

        {/* Table */}
        <div className="admin-card">
          {loading ? (
            <div style={{ padding: '48px 0', display: 'flex', justifyContent: 'center' }}>
              <VibeLoader label="Loading Catalog..." size="md" />
            </div>
          ) : (
            <>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Seller &amp; Category</th>
                      <th>Price / Stock</th>
                      <th>Status</th>
                      <th>Placement Flags</th>
                      <th style={{ textAlign: 'right' }}>Moderation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="admin-empty-cell">
                          No products match your filters.
                        </td>
                      </tr>
                    ) : (
                      products.map((prod) => {
                        const badge = getApprovalStatusStyle(prod.approvalStatus);
                        return (
                          <tr key={prod._id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img
                                  src={prod.images?.[0] || '/placeholder.png'}
                                  alt={prod.name}
                                  className="admin-thumb"
                                />
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ fontWeight: 700, color: '#0F172A', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {prod.name}
                                  </div>
                                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                                    {prod.brand} •{' '}
                                    <Link
                                      href={`/product/${prod.slug}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ color: '#2563EB', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                                    >
                                      Live Page <ExternalLink size={11} />
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>
                                {prod.sellerId?.storeName || 'VibeCart Direct'}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748B' }}>
                                {prod.category?.name || 'Uncategorized'}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 700 }}>{formatCurrency(prod.price)}</div>
                              <div
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  color: prod.stock <= 5 ? '#DC2626' : '#059669',
                                }}
                              >
                                Stock: {prod.stock}
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                                <span
                                  className="admin-status-pill"
                                  style={{ background: badge.bg, color: badge.color }}
                                >
                                  {prod.approvalStatus}
                                </span>
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    color: prod.active ? '#059669' : '#64748B',
                                  }}
                                >
                                  {prod.active ? '● Visible on Store' : '○ Hidden'}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleModerate(
                                      prod._id,
                                      { featured: !prod.featured },
                                      `${prod.name} ${prod.featured ? 'unfeatured' : 'featured'}.`
                                    )
                                  }
                                  className={`admin-flag-btn ${prod.featured ? 'on-amber' : ''}`}
                                  title="Toggle Featured"
                                >
                                  <Star size={12} /> Featured
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleModerate(
                                      prod._id,
                                      { trending: !prod.trending },
                                      `${prod.name} ${prod.trending ? 'removed from trending' : 'marked trending'}.`
                                    )
                                  }
                                  className={`admin-flag-btn ${prod.trending ? 'on-red' : ''}`}
                                  title="Toggle Trending"
                                >
                                  <Flame size={12} /> Trending
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleModerate(
                                      prod._id,
                                      { active: !prod.active },
                                      `${prod.name} ${prod.active ? 'paused' : 'activated'}.`
                                    )
                                  }
                                  className={`admin-flag-btn ${prod.active ? 'on-green' : ''}`}
                                  title="Toggle Storefront Visibility"
                                >
                                  {prod.active ? <Eye size={12} /> : <EyeOff size={12} />}{' '}
                                  {prod.active ? 'Live' : 'Hidden'}
                                </button>
                              </div>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                {prod.approvalStatus !== 'APPROVED' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleModerate(
                                        prod._id,
                                        { approvalStatus: 'APPROVED', active: true },
                                        `${prod.name} approved.`
                                      )
                                    }
                                    className="admin-btn-success-sm"
                                  >
                                    <CheckCircle2 size={13} /> Approve
                                  </button>
                                )}
                                {prod.approvalStatus !== 'REJECTED' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleModerate(
                                        prod._id,
                                        { approvalStatus: 'REJECTED' },
                                        `${prod.name} rejected.`
                                      )
                                    }
                                    className="admin-btn-outline-sm"
                                  >
                                    <XCircle size={13} /> Reject
                                  </button>
                                )}
                                {canDelete && (
                                  <button
                                    type="button"
                                    aria-label={`Delete ${prod.name}`}
                                    onClick={() => setDeleteTarget(prod)}
                                    className="admin-btn-danger-sm"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {pagination.totalPages > 1 && (
                <div className="admin-pagination">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="admin-btn-outline-sm"
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                    Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                  </span>
                  <button
                    type="button"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="admin-btn-outline-sm"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Product Permanently?"
        description={
          deleteTarget
            ? `Are you sure you want to permanently remove "${deleteTarget.name}" from the catalog? Existing order history stays preserved.`
            : ''
        }
        confirmLabel="Delete Product"
        danger
        loading={deleting}
        onConfirm={confirmDeleteProduct}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminShell>
  );
}
