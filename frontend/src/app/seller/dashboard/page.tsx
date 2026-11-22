'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { sellerApi, productApi, orderApi, categoryApi } from '@/lib/api';
import {
  Store,
  DollarSign,
  Package,
  ShoppingBag,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user, quickSwitchRole } = useAuth();
  const { showToast } = useToast();
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deletingProduct, setDeletingProduct] = useState(false);

  const [sellerProfile, setSellerProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add product modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '',
    brand: '',
    category: '',
    price: '',
    originalPrice: '',
    stock: '15',
    image: '',
    description: '',
  });
  const [isSubmittingProd, setIsSubmittingProd] = useState(false);

  const fetchSellerData = async () => {
    try {
      setLoading(true);
      const [profileRes, statsRes, ordersRes, catsRes] = await Promise.all([
        sellerApi.getMyProfile().catch(() => null),
        sellerApi.getDashboardStats().catch(() => null),
        orderApi.getSellerOrders().catch(() => ({ orders: [] })),
        categoryApi.getCategories().catch(() => ({ categories: [] })),
      ]);

      if (profileRes && profileRes.seller) {
        setSellerProfile(profileRes.seller);
        // Fetch products for this seller
        const prodsRes = await productApi.getProducts({ sellerId: profileRes.seller._id, limit: 50 });
        if (prodsRes && prodsRes.products) setProducts(prodsRes.products);
      } else {
        setSellerProfile(null);
      }

      if (statsRes && statsRes.stats) setStats(statsRes.stats);
      if (ordersRes && ordersRes.orders) setOrders(ordersRes.orders);
      if (catsRes && catsRes.categories) {
        setCategories(catsRes.categories);
        if (catsRes.categories.length > 0) {
          setNewProd((p) => ({ ...p, category: catsRes.categories[0]._id }));
        }
      }
    } catch (err) {
      console.error('Failed to load seller dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerData();
  }, [user?.role]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmittingProd(true);
      await productApi.createProduct({
        name: newProd.name,
        brand: newProd.brand,
        category: newProd.category,
        price: Number(newProd.price),
        originalPrice: newProd.originalPrice ? Number(newProd.originalPrice) : Number(newProd.price),
        stock: Number(newProd.stock),
        images: [newProd.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
        description: newProd.description,
      });
      setShowAddModal(false);
      setNewProd({
        name: '',
        brand: '',
        category: categories[0]?._id || '',
        price: '',
        originalPrice: '',
        stock: '15',
        image: '',
        description: '',
      });
      await fetchSellerData();
      showToast('success', 'Product Listed', 'Product created and published in your store.');
    } catch (err: any) {
      showToast('error', 'Listing Failed', err.message || 'Failed to create product');
    } finally {
      setIsSubmittingProd(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await orderApi.updateOrderStatus(orderId, status);
      await fetchSellerData();
      showToast('success', 'Order Updated', `Order status updated to ${status}.`);
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message || 'Failed to update order status');
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setDeleteTargetId(productId);
  };

  const confirmDeleteProduct = async () => {
    if (!deleteTargetId) return;
    try {
      setDeletingProduct(true);
      await productApi.deleteProduct(deleteTargetId);
      setDeleteTargetId(null);
      await fetchSellerData();
      showToast('success', 'Product Deleted', 'The product has been removed from your store.');
    } catch (err: any) {
      showToast('error', 'Delete Failed', err.message || 'Delete failed');
    } finally {
      setDeletingProduct(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <p style={{ color: '#64748B' }}>Loading seller portal...</p>
      </div>
    );
  }

  if (!sellerProfile) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '480px', margin: '0 auto', background: '#FFFFFF', padding: '40px 32px', borderRadius: '24px', border: '1px solid #E5E7EB', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <Store size={36} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px', color: '#111827' }}>Seller Store Access</h2>
          <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
            You are currently signed in as <strong>{user?.name} ({user?.role})</strong>. To manage products, view sales, and handle incoming orders, switch to the verified demo merchant or register a store.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => quickSwitchRole('SELLER')}
              style={{
                background: '#2874F0',
                color: '#FFFFFF',
                padding: '12px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Store size={16} />
              <span>Switch to Verified Seller (seller@vibecart.com)</span>
            </button>

            <Link
              href="/seller/register"
              className="btn-pill-dark"
              style={{ justifyContent: 'center', borderRadius: '8px', padding: '12px 20px' }}
            >
              Register a New Seller Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '36px 24px' }}>
      {/* Dashboard Top Header */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '28px',
          border: '1px solid #E5E7EB',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={sellerProfile.storeLogo || 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df?w=100'}
            alt=""
            style={{ width: '56px', height: '56px', borderRadius: '14px', objectFit: 'cover' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827' }}>
                {sellerProfile.storeName}
              </h1>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  background: '#DCFCE7',
                  color: '#15803D',
                }}
              >
                {sellerProfile.verificationStatus}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
              Merchant: <strong>{sellerProfile.name}</strong> • {sellerProfile.businessName}
            </p>

            {/* Persona Switcher for easy testing */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>Test Persona:</span>
              {(['SELLER', 'ADMIN', 'CUSTOMER'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => quickSwitchRole(r)}
                  style={{
                    fontSize: '10px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #CBD5E1',
                    fontWeight: user?.role === r ? 800 : 500,
                    background: user?.role === r ? '#2874F0' : '#F1F5F9',
                    color: user?.role === r ? '#FFFFFF' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn-pill-dark"
          style={{ background: '#111827', color: '#FFFFFF' }}
        >
          <Plus size={16} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '18px', border: '1px solid #F1F5F9' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>TOTAL EARNINGS</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginTop: '6px' }}>
            ₹{(stats?.totalEarnings || 0).toLocaleString('en-IN')}
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '18px', border: '1px solid #F1F5F9' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>TOTAL ORDERS</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginTop: '6px' }}>
            {stats?.totalOrders || orders.length}
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '18px', border: '1px solid #F1F5F9' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>PENDING DISPATCH</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#D97706', marginTop: '6px' }}>
            {stats?.pendingOrders || 0}
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '20px', borderRadius: '18px', border: '1px solid #F1F5F9' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>STORE RATING</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#16A34A', marginTop: '6px' }}>
            ★ {sellerProfile.rating || '4.8'}
          </div>
        </div>
      </div>

      {/* Store Products Management */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '28px',
          border: '1px solid #F1F5F9',
          marginBottom: '32px',
        }}
      >
        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '18px' }}>
          Store Catalog ({products.length} Products)
        </h3>

        {products.length === 0 ? (
          <p style={{ color: '#64748B', fontSize: '14px' }}>No products listed yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #F1F5F9', color: '#64748B' }}>
                  <th style={{ padding: '10px' }}>Product</th>
                  <th style={{ padding: '10px' }}>Price</th>
                  <th style={{ padding: '10px' }}>Stock</th>
                  <th style={{ padding: '10px' }}>Rating</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod._id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td style={{ padding: '12px 10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={prod.images && prod.images.length > 0 ? prod.images[0] : ''}
                        alt=""
                        style={{ width: '38px', height: '38px', objectFit: 'contain', borderRadius: '6px' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: '#111827' }}>{prod.name}</div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>{prod.brand}</div>
                      </div>
                    </td>
                    <td style={{ padding: '10px', fontWeight: 700 }}>₹{prod.price.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ fontWeight: 700, color: prod.stock <= 5 ? '#EF4444' : '#111827' }}>
                        {prod.stock} units
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>★ {prod.rating || '4.5'}</td>
                    <td style={{ padding: '10px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          background: '#DCFCE7',
                          color: '#15803D',
                        }}
                      >
                        {prod.approvalStatus}
                      </span>
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteProduct(prod._id)}
                        style={{ color: '#EF4444', padding: '6px' }}
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Seller Incoming Orders */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '28px',
          border: '1px solid #F1F5F9',
        }}
      >
        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '18px' }}>
          Customer Orders Received ({orders.length})
        </h3>

        {orders.length === 0 ? (
          <p style={{ color: '#64748B', fontSize: '14px' }}>No orders received yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {orders.map((ord) => (
              <div
                key={ord._id}
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '16px',
                  padding: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>
                    ORDER #{ord.orderNumber}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '14px', marginTop: '2px' }}>
                    Customer: {ord.customerId?.name || 'Customer'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN')}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <select
                    value={ord.status}
                    onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      fontWeight: 700,
                    }}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>

                  <Link
                    href={`/orders/${ord.orderNumber || ord._id}`}
                    style={{ fontSize: '13px', fontWeight: 700, color: '#2563EB', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <span>View</span>
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '600px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '18px' }}>Add New Product</h3>
            <form onSubmit={handleAddProduct}>
              <div className="form-grid-2" style={{ marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Product Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wireless Noise-Cancelling Earbuds"
                    value={newProd.name}
                    onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Brand</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. boAt, Sony"
                    value={newProd.brand}
                    onChange={(e) => setNewProd({ ...newProd, brand: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              </div>

              <div className="form-grid-3" style={{ marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Category</label>
                  <select
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="1999"
                    value={newProd.price}
                    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Original MRP (₹)</label>
                  <input
                    type="number"
                    placeholder="3999"
                    value={newProd.originalPrice}
                    onChange={(e) => setNewProd({ ...newProd, originalPrice: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              </div>

              <div className="form-grid-2" style={{ marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Available Stock</label>
                  <input
                    type="number"
                    required
                    value={newProd.stock}
                    onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Image URL</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newProd.image}
                    onChange={(e) => setNewProd({ ...newProd, image: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Product Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Key features and details..."
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', background: '#F1F5F9', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProd}
                  className="btn-pill-dark"
                  style={{ padding: '8px 20px', fontSize: '13px' }}
                >
                  {isSubmittingProd ? 'Listing...' : 'List Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTargetId)}
        title="Delete Product"
        description="Are you sure you want to permanently delete this product from your store catalog? This action cannot be undone."
        confirmLabel="Delete Product"
        danger
        loading={deletingProduct}
        onConfirm={confirmDeleteProduct}
        onCancel={() => {
          if (!deletingProduct) setDeleteTargetId(null);
        }}
      />
    </div>
  );
}
