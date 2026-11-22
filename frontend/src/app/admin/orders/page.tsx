'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Eye,
  RefreshCw,
  X,
  MapPin,
  CreditCard,
  Clock,
  Package,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import {
  ORDER_STATUS_OPTIONS,
  formatCurrency,
  formatDateTime,
  formatShortDate,
  getOrderStatusStyle,
  isAdminRole,
} from '@/components/admin/adminHelpers';
import { orderApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { VibeLoader } from '@/components/VibeLoader';

const STATUS_TABS = [
  'ALL',
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'RETURN_REQUESTED',
  'RETURNED',
  'REFUNDED',
] as const;

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const initialStatus = searchParams.get('status')?.toUpperCase() || 'ALL';
  const initialSearch = searchParams.get('search') || '';

  const [statusFilter, setStatusFilter] = useState<string>(
    (STATUS_TABS as readonly string[]).includes(initialStatus) ? initialStatus : 'ALL'
  );
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [activeSearch, setActiveSearch] = useState(initialSearch);
  const [page, setPage] = useState(1);

  const [orders, setOrders] = useState<any[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [statusDraft, setStatusDraft] = useState<{
    order: any;
    nextStatus: string;
    note: string;
  } | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await orderApi.getAllOrdersAdmin({
        status: statusFilter,
        search: activeSearch,
        page,
        limit: 15,
      });
      setOrders(res?.orders || []);
      setStatusCounts(res?.statusCounts || {});
      if (res?.pagination) setPagination(res.pagination);
      if (selectedOrder) {
        const refreshed = (res?.orders || []).find((o: any) => o._id === selectedOrder._id);
        if (refreshed) setSelectedOrder(refreshed);
      }
    } catch (err: any) {
      showToast('error', 'Failed to load orders', err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, activeSearch, page, showToast, selectedOrder?._id]);

  useEffect(() => {
    if (user && isAdminRole(user.role)) {
      loadOrders();
    }
  }, [user, loadOrders]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchInput.trim());
  };

  const openStatusEditor = (order: any, presetStatus?: string) => {
    setStatusDraft({
      order,
      nextStatus: presetStatus || order.status,
      note: '',
    });
  };

  const handleApplyStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusDraft) return;
    try {
      setUpdatingStatus(true);
      const res = await orderApi.updateOrderStatus(
        statusDraft.order._id,
        statusDraft.nextStatus,
        statusDraft.note.trim() || undefined
      );
      showToast(
        'success',
        'Order Updated',
        `Order #${statusDraft.order.orderNumber} set to ${statusDraft.nextStatus}.`
      );
      if (selectedOrder && selectedOrder._id === statusDraft.order._id && res?.order) {
        setSelectedOrder((prev: any) =>
          prev
            ? {
                ...prev,
                status: res.order.status,
                timeline: res.order.timeline || res.order.statusHistory,
                paymentInfo: res.order.paymentInfo,
              }
            : prev
        );
      }
      setStatusDraft(null);
      await loadOrders();
    } catch (err: any) {
      showToast('error', 'Status Update Failed', err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <AdminShell
      title="Manage Orders"
      subtitle="Search orders, verify payments, update fulfillment statuses & audit order timelines"
      actions={
        <button type="button" onClick={loadOrders} className="admin-btn-outline-sm">
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Filter Chips */}
        <div className="admin-chip-strip" role="tablist" aria-label="Filter orders by status">
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab;
            const count = statusCounts[tab];
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setStatusFilter(tab);
                  setPage(1);
                }}
                className={`admin-filter-chip ${active ? 'active' : ''}`}
              >
                <span>{tab.replace(/_/g, ' ')}</span>
                {typeof count === 'number' && (
                  <span className="admin-chip-count">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Toolbar */}
        <div className="admin-toolbar-card">
          <form onSubmit={handleSearchSubmit} className="admin-search-form">
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by Order # (e.g. ORD-...), customer name, email, or city..."
                aria-label="Search orders"
                className="admin-form-input with-icon"
              />
              <Search size={16} color="#94A3B8" className="admin-input-icon" />
            </div>
            <button type="submit" className="admin-primary-btn">
              Search
            </button>
            {activeSearch && (
              <button
                type="button"
                className="admin-btn-outline-sm"
                onClick={() => {
                  setSearchInput('');
                  setActiveSearch('');
                  setPage(1);
                }}
              >
                Clear
              </button>
            )}
          </form>
          <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
            Showing {orders.length} of {pagination.total} order{pagination.total === 1 ? '' : 's'}
          </div>
        </div>

        {/* Orders Table */}
        <div className="admin-card">
          {loading ? (
            <div style={{ padding: '48px 0', display: 'flex', justifyContent: 'center' }}>
              <VibeLoader label="Loading Orders..." size="md" />
            </div>
          ) : (
            <>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Payment</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Manage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="admin-empty-cell">
                          No orders match your current filter or search query.
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => {
                        const badge = getOrderStatusStyle(order.status);
                        const firstItem = order.items?.[0];
                        const itemCount =
                          order.items?.reduce((acc: number, it: any) => acc + (it.quantity || 1), 0) ||
                          0;
                        return (
                          <tr key={order._id}>
                            <td>
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(order)}
                                className="admin-order-num-btn"
                              >
                                {order.orderNumber}
                              </button>
                              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                                {formatShortDate(order.createdAt)}
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, color: '#0F172A' }}>
                                {order.customerId?.name || order.shippingAddress?.fullName || 'Guest'}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748B' }}>
                                {order.customerId?.email || ''}
                              </div>
                              <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                                {order.shippingAddress?.city}, {order.shippingAddress?.state}
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {(firstItem?.image || firstItem?.productImage) && (
                                  <img
                                    src={firstItem.image || firstItem.productImage}
                                    alt={firstItem.name}
                                    className="admin-thumb-sm"
                                  />
                                )}
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '13px', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {firstItem?.name || 'Order items'}
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                                    {itemCount} unit{itemCount === 1 ? '' : 's'} ({order.items?.length || 0} line{order.items?.length === 1 ? '' : 's'})
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 700, fontSize: '12px' }}>
                                {order.paymentInfo?.method || 'COD'}
                              </div>
                              <div
                                style={{
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  color: order.paymentInfo?.status === 'PAID' ? '#059669' : '#D97706',
                                }}
                              >
                                {order.paymentInfo?.status || 'PENDING'}
                              </div>
                            </td>
                            <td style={{ fontWeight: 800, color: '#0F172A' }}>
                              {formatCurrency(order.totalAmount)}
                            </td>
                            <td>
                              <span
                                className="admin-status-pill"
                                style={{
                                  background: badge.bg,
                                  color: badge.color,
                                  borderColor: badge.border,
                                }}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrder(order)}
                                  className="admin-btn-outline-sm"
                                >
                                  <Eye size={13} />
                                  <span>Inspect</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openStatusEditor(order)}
                                  className="admin-primary-btn-sm"
                                >
                                  Update Status
                                </button>
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
                    Page {pagination.page} of {pagination.totalPages}
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

      {/* Order Detail & Timeline Inspector Modal */}
      {selectedOrder && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`Order details for ${selectedOrder.orderNumber}`}
          onClick={() => setSelectedOrder(null)}
        >
          <div className="admin-modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h2 className="admin-modal-title">Order #{selectedOrder.orderNumber}</h2>
                  <span
                    className="admin-status-pill"
                    style={{
                      background: getOrderStatusStyle(selectedOrder.status).bg,
                      color: getOrderStatusStyle(selectedOrder.status).color,
                      borderColor: getOrderStatusStyle(selectedOrder.status).border,
                    }}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
                  Placed on {formatDateTime(selectedOrder.createdAt)} • Customer:{' '}
                  {selectedOrder.customerId?.name || selectedOrder.shippingAddress?.fullName} (
                  {selectedOrder.customerId?.email || '—'})
                </p>
              </div>
              <button
                type="button"
                aria-label="Close inspector"
                onClick={() => setSelectedOrder(null)}
                className="admin-icon-close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-modal-body">
              {/* Quick Status Action Strip */}
              <div className="admin-inspector-bar">
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                  Fulfillment Control
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="admin-primary-btn-sm"
                    onClick={() => openStatusEditor(selectedOrder)}
                  >
                    Change Status / Add Tracking Note
                  </button>
                  <Link
                    href={`/orders/${selectedOrder.orderNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="admin-btn-outline-sm"
                  >
                    Customer View ↗
                  </Link>
                </div>
              </div>

              {/* Address + Payment Summary */}
              <div className="admin-inspector-grid">
                <div className="admin-subcard">
                  <div className="admin-subcard-title">
                    <MapPin size={15} color="#2563EB" /> Shipping Destination
                  </div>
                  <div style={{ fontSize: '13px', lineHeight: 1.6, color: '#334155' }}>
                    <div style={{ fontWeight: 700, color: '#0F172A' }}>
                      {selectedOrder.shippingAddress?.fullName}
                    </div>
                    <div>{selectedOrder.shippingAddress?.street}</div>
                    <div>
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}{' '}
                      {selectedOrder.shippingAddress?.postalCode}
                    </div>
                    <div>
                      {selectedOrder.shippingAddress?.country || 'India'} • Ph:{' '}
                      {selectedOrder.shippingAddress?.phone}
                    </div>
                  </div>
                </div>

                <div className="admin-subcard">
                  <div className="admin-subcard-title">
                    <CreditCard size={15} color="#10B981" /> Payment &amp; Totals
                  </div>
                  <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div className="admin-kv">
                      <span>Method / State</span>
                      <strong>
                        {selectedOrder.paymentInfo?.method} ({selectedOrder.paymentInfo?.status})
                      </strong>
                    </div>
                    <div className="admin-kv">
                      <span>Items Subtotal</span>
                      <span>{formatCurrency(selectedOrder.subtotal ?? selectedOrder.itemsPrice)}</span>
                    </div>
                    <div className="admin-kv">
                      <span>Shipping</span>
                      <span>
                        {formatCurrency(
                          (selectedOrder.shippingFee ?? selectedOrder.shippingPrice ?? 0) +
                            (selectedOrder.taxPrice || 0)
                        )}
                      </span>
                    </div>
                    {(selectedOrder.discount ?? selectedOrder.discountAmount ?? 0) > 0 && (
                      <div className="admin-kv" style={{ color: '#059669' }}>
                        <span>Coupon ({selectedOrder.couponCode || 'Promo'})</span>
                        <span>-{formatCurrency(selectedOrder.discount ?? selectedOrder.discountAmount)}</span>
                      </div>
                    )}
                    <div
                      className="admin-kv"
                      style={{ borderTop: '1px solid #E2E8F0', paddingTop: '6px', fontSize: '14px' }}
                    >
                      <strong>Grand Total</strong>
                      <strong>{formatCurrency(selectedOrder.totalAmount)}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="admin-subcard">
                <div className="admin-subcard-title">
                  <Package size={15} color="#7C3AED" /> Ordered Items ({selectedOrder.items?.length || 0})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(selectedOrder.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="admin-order-item-row">
                      <img
                        src={item.image || item.productImage || '/placeholder.png'}
                        alt={item.name}
                        className="admin-thumb"
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>
                          Qty: {item.quantity} × {formatCurrency(item.price)}
                          {item.variant ? ` • Variant: ${item.variant}` : ''}
                          {item.seller?.storeName ? ` • Seller: ${item.seller.storeName}` : ''}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '13px' }}>
                        {formatCurrency((item.price || 0) * (item.quantity || 1))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="admin-subcard">
                <div className="admin-subcard-title">
                  <Clock size={15} color="#D97706" /> Status Timeline
                </div>
                <div className="admin-timeline">
                  {(selectedOrder.timeline || selectedOrder.statusHistory || []).map((entry: any, i: number) => (
                    <div key={i} className="admin-timeline-item">
                      <div className="admin-timeline-dot" />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: '#0F172A' }}>
                          {entry.status}
                        </div>
                        <div style={{ fontSize: '12px', color: '#475569' }}>
                          {entry.note || 'Status recorded'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                          {formatDateTime(entry.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {statusDraft && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Update order status"
          onClick={() => !updatingStatus && setStatusDraft(null)}
        >
          <div className="admin-modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">
                Update Order #{statusDraft.order.orderNumber}
              </h2>
              <button
                type="button"
                aria-label="Close status modal"
                disabled={updatingStatus}
                onClick={() => setStatusDraft(null)}
                className="admin-icon-close"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleApplyStatusUpdate} className="admin-modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label htmlFor="order-status-select" className="admin-form-label">
                    Target Order Status
                  </label>
                  <select
                    id="order-status-select"
                    value={statusDraft.nextStatus}
                    onChange={(e) =>
                      setStatusDraft((prev) =>
                        prev ? { ...prev, nextStatus: e.target.value } : prev
                      )
                    }
                    className="admin-form-input"
                  >
                    {ORDER_STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="order-status-note" className="admin-form-label">
                    Timeline Note / Tracking Info (Optional)
                  </label>
                  <textarea
                    id="order-status-note"
                    rows={3}
                    value={statusDraft.note}
                    onChange={(e) =>
                      setStatusDraft((prev) => (prev ? { ...prev, note: e.target.value } : prev))
                    }
                    placeholder="e.g. Dispatched via BlueDart AWB #849201"
                    className="admin-form-input"
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => setStatusDraft(null)}
                    className="admin-btn-outline-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingStatus}
                    className="admin-primary-btn"
                  >
                    {updatingStatus ? 'Saving...' : 'Apply Status'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <AdminShell title="Manage Orders" subtitle="Loading orders console...">
          <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
            <VibeLoader label="Loading Orders Console..." size="lg" />
          </div>
        </AdminShell>
      }
    >
      <AdminOrdersContent />
    </Suspense>
  );
}
