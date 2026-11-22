'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Tag, Layers, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { AdminShell } from '@/components/admin/AdminShell';
import {
  formatCurrency,
  formatShortDate,
  isAdminRole,
  isFullAdminRole,
} from '@/components/admin/adminHelpers';
import { couponApi, categoryApi, bannerApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { VibeLoader } from '@/components/VibeLoader';

type PromoTab = 'COUPONS' | 'CATEGORIES' | 'BANNERS';

export default function AdminPromotionsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [tab, setTab] = useState<PromoTab>('COUPONS');
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);

  const canModify = isFullAdminRole(user?.role);

  // Coupon form
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountAmount: '15',
    minOrderValue: '499',
    maxDiscount: '500',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    usageLimit: '500',
  });

  // Category form
  const [catForm, setCatForm] = useState({
    name: '',
    icon: '✨',
    bgColor: '#EFF6FF',
    description: '',
    order: '10',
  });

  // Banner form
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    badge: 'LIMITED OFFER',
    image: '',
    ctaText: 'Shop Now',
    ctaLink: '/search',
    position: 'HERO',
    sortOrder: '5',
    bgColor: '#0F172A',
    accentColor: '#3B82F6',
  });

  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    kind: PromoTab;
    id: string;
    label: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [cRes, catRes, bRes] = await Promise.all([
        couponApi.getAllAdmin().catch(() => ({ coupons: [] })),
        categoryApi.getCategories().catch(() => ({ categories: [] })),
        bannerApi.getBanners().catch(() => ({ banners: [] })),
      ]);
      setCoupons(cRes?.coupons || []);
      setCategories(catRes?.categories || []);
      setBanners(bRes?.banners || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && isAdminRole(user.role)) {
      loadAll();
    }
  }, [user, loadAll]);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await couponApi.createCoupon({
        code: couponForm.code.trim().toUpperCase(),
        description: couponForm.description.trim(),
        discountType: couponForm.discountType,
        discountAmount: Number(couponForm.discountAmount),
        minOrderValue: Number(couponForm.minOrderValue || 0),
        maxDiscount: couponForm.maxDiscount ? Number(couponForm.maxDiscount) : undefined,
        expiresAt: new Date(`${couponForm.expiresAt}T23:59:59.000Z`).toISOString(),
        usageLimit: Number(couponForm.usageLimit || 1000),
      });
      showToast('success', 'Coupon Created', `${couponForm.code.toUpperCase()} is now active.`);
      setCouponForm((prev) => ({ ...prev, code: '', description: '' }));
      await loadAll();
    } catch (err: any) {
      showToast('error', 'Failed to Create Coupon', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await categoryApi.createCategory({
        name: catForm.name.trim(),
        icon: catForm.icon.trim() || '📦',
        bgColor: catForm.bgColor,
        description: catForm.description.trim(),
        order: Number(catForm.order || 0),
      });
      showToast('success', 'Category Created', `${catForm.name} added to storefront nav.`);
      setCatForm((prev) => ({ ...prev, name: '', description: '' }));
      await loadAll();
    } catch (err: any) {
      showToast('error', 'Failed to Create Category', err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await bannerApi.createBanner({
        ...bannerForm,
        sortOrder: Number(bannerForm.sortOrder || 0),
      });
      showToast('success', 'Banner Published', `${bannerForm.title} added to ${bannerForm.position}.`);
      setBannerForm((prev) => ({ ...prev, title: '', subtitle: '', image: '' }));
      await loadAll();
    } catch (err: any) {
      showToast('error', 'Failed to Create Banner', err.message);
    } finally {
      setSaving(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    try {
      setDeleting(true);
      if (deleteConfirm.kind === 'COUPONS') {
        await couponApi.deleteCoupon(deleteConfirm.id);
      } else if (deleteConfirm.kind === 'CATEGORIES') {
        await categoryApi.deleteCategory(deleteConfirm.id);
      } else {
        await bannerApi.deleteBanner(deleteConfirm.id);
      }
      showToast('success', 'Deleted', `${deleteConfirm.label} removed.`);
      setDeleteConfirm(null);
      await loadAll();
    } catch (err: any) {
      showToast('error', 'Delete Failed', err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminShell
      title="Coupons, Categories & Banners"
      subtitle="Manage promo codes, department navigation & hero campaign placements"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="admin-chip-strip" role="tablist" aria-label="Promotions subsections">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'COUPONS'}
            onClick={() => setTab('COUPONS')}
            className={`admin-filter-chip ${tab === 'COUPONS' ? 'active' : ''}`}
          >
            <Tag size={14} /> Coupons ({coupons.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'CATEGORIES'}
            onClick={() => setTab('CATEGORIES')}
            className={`admin-filter-chip ${tab === 'CATEGORIES' ? 'active' : ''}`}
          >
            <Layers size={14} /> Categories ({categories.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'BANNERS'}
            onClick={() => setTab('BANNERS')}
            className={`admin-filter-chip ${tab === 'BANNERS' ? 'active' : ''}`}
          >
            <ImageIcon size={14} /> Hero &amp; Promo Banners ({banners.length})
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '48px 0', display: 'flex', justifyContent: 'center' }}>
            <VibeLoader label="Loading Storefront Merchandising..." size="md" />
          </div>
        ) : (
          <>
            {tab === 'COUPONS' && (
              <div className="admin-split-grid">
                <section className="admin-card">
                  <div className="admin-card-header">
                    <div>
                      <h2 className="admin-card-title">All Promo Coupons</h2>
                      <p className="admin-card-sub">
                        Includes active, maxed-out &amp; expired discount codes
                      </p>
                    </div>
                  </div>
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Discount</th>
                          <th>Usage</th>
                          <th>Expires</th>
                          <th>State</th>
                          {canModify && <th style={{ textAlign: 'right' }}>Delete</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {coupons.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="admin-empty-cell">
                              No coupons configured.
                            </td>
                          </tr>
                        ) : (
                          coupons.map((c) => {
                            const expired = new Date(c.expiresAt).getTime() < Date.now();
                            return (
                              <tr key={c._id}>
                                <td>
                                  <div style={{ fontWeight: 800, color: '#0F172A' }}>{c.code}</div>
                                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                                    {c.description}
                                  </div>
                                </td>
                                <td>
                                  <div style={{ fontWeight: 700 }}>
                                    {c.discountType === 'PERCENTAGE'
                                      ? `${c.discountAmount}% OFF`
                                      : `${formatCurrency(c.discountAmount)} OFF`}
                                  </div>
                                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                                    Min order: {formatCurrency(c.minOrderValue)}
                                  </div>
                                </td>
                                <td style={{ fontSize: '13px', fontWeight: 600 }}>
                                  {c.usedCount || 0} / {c.usageLimit || 1000}
                                </td>
                                <td style={{ fontSize: '13px', color: '#64748B' }}>
                                  {formatShortDate(c.expiresAt)}
                                </td>
                                <td>
                                  <span
                                    className="admin-status-pill"
                                    style={{
                                      background: expired || !c.active ? '#FEE2E2' : '#DCFCE7',
                                      color: expired || !c.active ? '#991B1B' : '#166534',
                                    }}
                                  >
                                    {expired ? 'EXPIRED' : c.active ? 'ACTIVE' : 'PAUSED'}
                                  </span>
                                </td>
                                {canModify && (
                                  <td style={{ textAlign: 'right' }}>
                                    <button
                                      type="button"
                                      aria-label={`Delete coupon ${c.code}`}
                                      onClick={() =>
                                        setDeleteConfirm({
                                          kind: 'COUPONS',
                                          id: c._id,
                                          label: `Coupon "${c.code}"`,
                                        })
                                      }
                                      className="admin-btn-danger-sm"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </td>
                                )}
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
                    <h2 className="admin-card-title">Create New Coupon</h2>
                  </div>
                  {!canModify ? (
                    <p style={{ fontSize: '13px', color: '#64748B' }}>
                      Admin or Super Admin privileges required to create or delete coupons.
                    </p>
                  ) : (
                    <form onSubmit={handleCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label htmlFor="coupon-code" className="admin-form-label">Coupon Code</label>
                        <input
                          id="coupon-code"
                          required
                          placeholder="FESTIVE20"
                          value={couponForm.code}
                          onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                          className="admin-form-input"
                        />
                      </div>
                      <div>
                        <label htmlFor="coupon-desc" className="admin-form-label">Description</label>
                        <input
                          id="coupon-desc"
                          required
                          placeholder="Save 20% on curated tech & style"
                          value={couponForm.description}
                          onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                          className="admin-form-input"
                        />
                      </div>
                      <div className="admin-form-row2">
                        <div>
                          <label htmlFor="coupon-type" className="admin-form-label">Type</label>
                          <select
                            id="coupon-type"
                            value={couponForm.discountType}
                            onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                            className="admin-form-input"
                          >
                            <option value="PERCENTAGE">PERCENTAGE (%)</option>
                            <option value="FIXED">FIXED (₹)</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="coupon-amount" className="admin-form-label">Discount Value</label>
                          <input
                            id="coupon-amount"
                            type="number"
                            min={1}
                            required
                            value={couponForm.discountAmount}
                            onChange={(e) => setCouponForm({ ...couponForm, discountAmount: e.target.value })}
                            className="admin-form-input"
                          />
                        </div>
                      </div>
                      <div className="admin-form-row2">
                        <div>
                          <label htmlFor="coupon-min" className="admin-form-label">Min Order (₹)</label>
                          <input
                            id="coupon-min"
                            type="number"
                            min={0}
                            value={couponForm.minOrderValue}
                            onChange={(e) => setCouponForm({ ...couponForm, minOrderValue: e.target.value })}
                            className="admin-form-input"
                          />
                        </div>
                        <div>
                          <label htmlFor="coupon-max" className="admin-form-label">Max Cap (₹)</label>
                          <input
                            id="coupon-max"
                            type="number"
                            min={0}
                            value={couponForm.maxDiscount}
                            onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
                            className="admin-form-input"
                          />
                        </div>
                      </div>
                      <div className="admin-form-row2">
                        <div>
                          <label htmlFor="coupon-exp" className="admin-form-label">Expires On</label>
                          <input
                            id="coupon-exp"
                            type="date"
                            required
                            value={couponForm.expiresAt}
                            onChange={(e) => setCouponForm({ ...couponForm, expiresAt: e.target.value })}
                            className="admin-form-input"
                          />
                        </div>
                        <div>
                          <label htmlFor="coupon-limit" className="admin-form-label">Usage Limit</label>
                          <input
                            id="coupon-limit"
                            type="number"
                            min={1}
                            value={couponForm.usageLimit}
                            onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                            className="admin-form-input"
                          />
                        </div>
                      </div>
                      <button type="submit" disabled={saving} className="admin-primary-btn" style={{ justifyContent: 'center' }}>
                        <Plus size={15} /> {saving ? 'Creating...' : 'Create Coupon'}
                      </button>
                    </form>
                  )}
                </section>
              </div>
            )}

            {tab === 'CATEGORIES' && (
              <div className="admin-split-grid">
                <section className="admin-card">
                  <div className="admin-card-header">
                    <h2 className="admin-card-title">Storefront Categories</h2>
                  </div>
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Slug</th>
                          <th>Order</th>
                          {canModify && <th style={{ textAlign: 'right' }}>Delete</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {categories.map((cat) => (
                          <tr key={cat._id}>
                            <td style={{ fontWeight: 700 }}>
                              <span style={{ marginRight: '8px' }}>{cat.icon || '📦'}</span>
                              {cat.name}
                            </td>
                            <td style={{ fontSize: '12px', color: '#64748B' }}>/{cat.slug}</td>
                            <td style={{ fontSize: '13px', fontWeight: 600 }}>{cat.order ?? 0}</td>
                            {canModify && (
                              <td style={{ textAlign: 'right' }}>
                                <button
                                  type="button"
                                  aria-label={`Delete category ${cat.name}`}
                                  onClick={() =>
                                    setDeleteConfirm({
                                      kind: 'CATEGORIES',
                                      id: cat._id,
                                      label: `Category "${cat.name}"`,
                                    })
                                  }
                                  className="admin-btn-danger-sm"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="admin-card">
                  <div className="admin-card-header">
                    <h2 className="admin-card-title">Add Category</h2>
                  </div>
                  {!canModify ? (
                    <p style={{ fontSize: '13px', color: '#64748B' }}>
                      Admin or Super Admin privileges required.
                    </p>
                  ) : (
                    <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label htmlFor="cat-name" className="admin-form-label">Category Name</label>
                        <input
                          id="cat-name"
                          required
                          placeholder="Smart Home"
                          value={catForm.name}
                          onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                          className="admin-form-input"
                        />
                      </div>
                      <div className="admin-form-row2">
                        <div>
                          <label htmlFor="cat-icon" className="admin-form-label">Icon Emoji</label>
                          <input
                            id="cat-icon"
                            value={catForm.icon}
                            onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
                            className="admin-form-input"
                          />
                        </div>
                        <div>
                          <label htmlFor="cat-order" className="admin-form-label">Sort Order</label>
                          <input
                            id="cat-order"
                            type="number"
                            value={catForm.order}
                            onChange={(e) => setCatForm({ ...catForm, order: e.target.value })}
                            className="admin-form-input"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="cat-desc" className="admin-form-label">Short Description</label>
                        <input
                          id="cat-desc"
                          placeholder="Connected bulbs, hubs & sensors"
                          value={catForm.description}
                          onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                          className="admin-form-input"
                        />
                      </div>
                      <button type="submit" disabled={saving} className="admin-primary-btn" style={{ justifyContent: 'center' }}>
                        <Plus size={15} /> {saving ? 'Adding...' : 'Create Category'}
                      </button>
                    </form>
                  )}
                </section>
              </div>
            )}

            {tab === 'BANNERS' && (
              <div className="admin-split-grid">
                <section className="admin-card">
                  <div className="admin-card-header">
                    <h2 className="admin-card-title">Active Storefront Banners</h2>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {banners.length === 0 ? (
                      <div className="admin-empty-cell">No active banners configured.</div>
                    ) : (
                      banners.map((b) => (
                        <div key={b._id} className="admin-mini-row">
                          <img src={b.image || '/placeholder.png'} alt={b.title} className="admin-thumb" />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '14px' }}>{b.title}</div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>
                              Position: <strong>{b.position}</strong> • CTA: {b.ctaText} ({b.ctaLink})
                            </div>
                          </div>
                          {canModify && (
                            <button
                              type="button"
                              aria-label={`Delete banner ${b.title}`}
                              onClick={() =>
                                setDeleteConfirm({
                                  kind: 'BANNERS',
                                  id: b._id,
                                  label: `Banner "${b.title}"`,
                                })
                              }
                              className="admin-btn-danger-sm"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <section className="admin-card">
                  <div className="admin-card-header">
                    <h2 className="admin-card-title">Publish Banner</h2>
                  </div>
                  {!canModify ? (
                    <p style={{ fontSize: '13px', color: '#64748B' }}>
                      Admin or Super Admin privileges required.
                    </p>
                  ) : (
                    <form onSubmit={handleCreateBanner} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label htmlFor="ban-title" className="admin-form-label">Headline</label>
                        <input
                          id="ban-title"
                          required
                          placeholder="Summer Tech Drop"
                          value={bannerForm.title}
                          onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                          className="admin-form-input"
                        />
                      </div>
                      <div>
                        <label htmlFor="ban-sub" className="admin-form-label">Subtitle</label>
                        <input
                          id="ban-sub"
                          placeholder="Up to 40% off flagship headphones"
                          value={bannerForm.subtitle}
                          onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                          className="admin-form-input"
                        />
                      </div>
                      <div>
                        <label htmlFor="ban-img" className="admin-form-label">Image URL</label>
                        <input
                          id="ban-img"
                          type="url"
                          required
                          placeholder="https://images.unsplash.com/..."
                          value={bannerForm.image}
                          onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                          className="admin-form-input"
                        />
                      </div>
                      <div className="admin-form-row2">
                        <div>
                          <label htmlFor="ban-pos" className="admin-form-label">Slot</label>
                          <select
                            id="ban-pos"
                            value={bannerForm.position}
                            onChange={(e) => setBannerForm({ ...bannerForm, position: e.target.value })}
                            className="admin-form-input"
                          >
                            <option value="HERO">HERO</option>
                            <option value="MID_PROMO">MID_PROMO</option>
                            <option value="CATEGORY_STRIP">CATEGORY_STRIP</option>
                          </select>
                        </div>
                        <div>
                          <label htmlFor="ban-cta" className="admin-form-label">CTA Link</label>
                          <input
                            id="ban-cta"
                            value={bannerForm.ctaLink}
                            onChange={(e) => setBannerForm({ ...bannerForm, ctaLink: e.target.value })}
                            className="admin-form-input"
                          />
                        </div>
                      </div>
                      <button type="submit" disabled={saving} className="admin-primary-btn" style={{ justifyContent: 'center' }}>
                        <Plus size={15} /> {saving ? 'Publishing...' : 'Publish Banner'}
                      </button>
                    </form>
                  )}
                </section>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteConfirm)}
        title="Confirm Removal"
        description={
          deleteConfirm
            ? `Permanently delete ${deleteConfirm.label}? This action will be recorded in the admin audit log.`
            : ''
        }
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </AdminShell>
  );
}
