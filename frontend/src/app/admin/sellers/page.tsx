'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Ban, XCircle, Search } from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import {
  getApprovalStatusStyle,
  isAdminRole,
  isFullAdminRole,
} from '@/components/admin/adminHelpers';
import { sellerApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { VibeLoader } from '@/components/VibeLoader';

const SELLER_TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'] as const;

function AdminSellersContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { showToast } = useToast();

  const initialStatus = searchParams.get('status')?.toUpperCase() || 'ALL';
  const [statusFilter, setStatusFilter] = useState<string>(
    (SELLER_TABS as readonly string[]).includes(initialStatus) ? initialStatus : 'ALL'
  );
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{ seller: any; status: string } | null>(null);
  const [updating, setUpdating] = useState(false);

  const canVerify = isFullAdminRole(user?.role);

  const loadSellers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await sellerApi.getAllSellersAdmin(
        statusFilter === 'ALL' ? undefined : statusFilter
      );
      setSellers(res?.sellers || []);
    } catch (err: any) {
      showToast('error', 'Failed to load sellers', err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, showToast]);

  useEffect(() => {
    if (user && isAdminRole(user.role)) {
      loadSellers();
    }
  }, [user, loadSellers]);

  const applySellerStatus = async (sellerId: string, status: string, storeName: string) => {
    try {
      setUpdating(true);
      await sellerApi.verifySeller(sellerId, status);
      showToast('success', 'Seller Updated', `${storeName} is now ${status}.`);
      setConfirmAction(null);
      await loadSellers();
    } catch (err: any) {
      showToast('error', 'Verification Update Failed', err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AdminShell
      title="Sellers & Verification"
      subtitle="Inspect vendor onboarding requests, GST details & storefront compliance"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div className="admin-chip-strip" role="tablist" aria-label="Filter sellers by verification">
          {SELLER_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={statusFilter === tab}
              onClick={() => setStatusFilter(tab)}
              className={`admin-filter-chip ${statusFilter === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="admin-card">
          {loading ? (
            <div style={{ padding: '48px 0', display: 'flex', justifyContent: 'center' }}>
              <VibeLoader label="Loading Sellers..." size="md" />
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Store</th>
                    <th>Owner Account</th>
                    <th>Business Entity</th>
                    <th>Rating &amp; Reviews</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="admin-empty-cell">
                        No sellers found for this status.
                      </td>
                    </tr>
                  ) : (
                    sellers.map((s) => {
                      const badge = getApprovalStatusStyle(s.verificationStatus);
                      return (
                        <tr key={s._id}>
                          <td>
                            <div style={{ fontWeight: 700, color: '#0F172A' }}>{s.storeName}</div>
                            <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>/{s.slug || s._id.slice(-6)}</span>
                              <Link
                                href={`/search?search=${encodeURIComponent(s.storeName || '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#2563EB', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                              >
                                <Search size={11} /> Catalog
                              </Link>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{s.userId?.name || 'Owner'}</div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>
                              {s.userId?.email || '—'}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '13px', fontWeight: 600 }}>
                              {s.businessName || s.storeName}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>
                              {s.phone || s.businessAddress || 'Verified vendor'}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700 }}>
                              {(s.rating || 4.5).toFixed(1)} ★
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>
                              {s.reviewCount || 0} reviews
                            </div>
                          </td>
                          <td>
                            <span
                              className="admin-status-pill"
                              style={{ background: badge.bg, color: badge.color }}
                            >
                              {s.verificationStatus}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {!canVerify ? (
                              <span style={{ fontSize: '12px', color: '#64748B' }}>Admin only</span>
                            ) : (
                              <div style={{ display: 'inline-flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                {s.verificationStatus !== 'APPROVED' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      applySellerStatus(s._id, 'APPROVED', s.storeName)
                                    }
                                    className="admin-btn-success-sm"
                                  >
                                    <CheckCircle2 size={13} /> Approve
                                  </button>
                                )}
                                {s.verificationStatus !== 'REJECTED' && (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmAction({ seller: s, status: 'REJECTED' })}
                                    className="admin-btn-outline-sm"
                                  >
                                    <XCircle size={13} /> Reject
                                  </button>
                                )}
                                {s.verificationStatus !== 'SUSPENDED' && (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmAction({ seller: s, status: 'SUSPENDED' })}
                                    className="admin-btn-danger-sm"
                                  >
                                    <Ban size={13} /> Suspend
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(confirmAction)}
        title={
          confirmAction
            ? `${confirmAction.status === 'SUSPENDED' ? 'Suspend' : 'Reject'} "${confirmAction.seller.storeName}"?`
            : ''
        }
        description={
          confirmAction
            ? `This will set the vendor's verification status to ${confirmAction.status} and restrict storefront selling privileges.`
            : ''
        }
        confirmLabel={confirmAction?.status === 'SUSPENDED' ? 'Suspend Store' : 'Reject Seller'}
        danger
        loading={updating}
        onConfirm={() => {
          if (confirmAction) {
            applySellerStatus(
              confirmAction.seller._id,
              confirmAction.status,
              confirmAction.seller.storeName
            );
          }
        }}
        onCancel={() => setConfirmAction(null)}
      />
    </AdminShell>
  );
}

export default function AdminSellersPage() {
  return (
    <Suspense
      fallback={
        <AdminShell title="Sellers & Verification" subtitle="Loading sellers...">
          <div style={{ padding: '60px 0', display: 'flex', justifyContent: 'center' }}>
            <VibeLoader label="Loading Sellers Console..." size="lg" />
          </div>
        </AdminShell>
      }
    >
      <AdminSellersContent />
    </Suspense>
  );
}
