'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Tag,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react';
import { cartApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { VibeLoader } from '@/components/VibeLoader';

export default function CartPage() {
  const router = useRouter();
  const { refreshCartCount } = useAuth();
  const { showToast } = useToast();

  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await cartApi.getCart();
      if (res && res.cart) {
        setCart(res.cart);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQty = async (itemId: string, newQty: number) => {
    try {
      await cartApi.updateItem(itemId, newQty);
      await refreshCartCount();
      await fetchCart();
    } catch (err: any) {
      showToast('error', 'Cart Error', err.message || 'Failed to update quantity');
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await cartApi.removeItem(itemId);
      await refreshCartCount();
      await fetchCart();
      showToast('info', 'Item Removed', 'Product has been removed from your shopping cart.');
    } catch (err: any) {
      showToast('error', 'Cart Error', err.message || 'Failed to remove item');
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      setCouponLoading(true);
      setCouponMessage(null);
      const res = await cartApi.applyCoupon(couponCode.trim());
      setCouponMessage({ text: res.message || 'Coupon applied successfully!', isError: false });
      showToast('success', 'Coupon Applied!', res.message || 'Discount applied to your order.');
      await fetchCart();
    } catch (err: any) {
      setCouponMessage({ text: err.message || 'Invalid coupon code', isError: true });
      showToast('error', 'Coupon Error', err.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    try {
      await cartApi.removeCoupon();
      setCouponMessage(null);
      setCouponCode('');
      await fetchCart();
      showToast('info', 'Coupon Removed', 'Promotional discount has been removed.');
    } catch (err: any) {
      showToast('error', 'Cart Error', err.message || 'Failed to remove coupon');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <VibeLoader label="Synchronizing Shopping Bag..." size="lg" />
      </div>
    );
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            color: '#94A3B8',
          }}
        >
          <ShoppingBag size={40} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
          Your Cart is Empty
        </h2>
        <p style={{ color: '#64748B', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px auto' }}>
          Looks like you haven&apos;t added any vibe-worthy items to your cart yet.
        </p>
        <Link href="/" className="btn-pill-dark">
          Explore Trending Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '36px 24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', marginBottom: '24px' }}>
        Shopping Cart ({cart.itemCount} items)
      </h1>

      <div className="checkout-split-grid">
        {/* Cart Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {items.map((item: any) => (
            <div
              key={item._id}
              className="cart-item-card"
              style={{
                background: '#FFFFFF',
                borderRadius: '20px',
                padding: '18px',
                border: '1px solid #F1F5F9',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
                alignItems: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              {/* Product Thumbnail */}
              <Link
                href={`/product/${item.slug}`}
                style={{
                  width: '88px',
                  height: '88px',
                  borderRadius: '12px',
                  background: '#F8FAFC',
                  border: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ maxWidth: '85%', maxHeight: '85%', objectFit: 'contain' }}
                />
              </Link>

              {/* Item Details */}
              <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                {item.seller && (
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                    Seller: {item.seller.storeName || 'ElectroVibe Official'}
                  </span>
                )}
                <Link href={`/product/${item.slug}`}>
                  <h4
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#111827',
                      margin: '2px 0 6px 0',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {item.name}
                  </h4>
                </Link>

                {(item.variantName ||
                  (item.variantId && !/^[a-f0-9]{24}$/i.test(String(item.variantId)))) && (
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#475569',
                      background: '#F1F5F9',
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    Variant: {item.variantName || item.variantId}
                  </span>
                )}

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>
                    ₹{item.unitPrice.toLocaleString('en-IN')}
                  </span>
                  {item.originalPrice > item.unitPrice && (
                    <span style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'line-through' }}>
                      ₹{item.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Controls & Remove */}
              <div className="cart-item-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', marginLeft: 'auto' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    type="button"
                    aria-label={`Decrease quantity for ${item.name}`}
                    onClick={() => handleUpdateQty(item._id, item.quantity - 1)}
                    style={{ padding: '6px 10px', background: '#F8FAFC' }}
                  >
                    <Minus size={13} />
                  </button>
                  <span style={{ padding: '4px 14px', fontWeight: 700, fontSize: '13px' }}>
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    aria-label={`Increase quantity for ${item.name}`}
                    onClick={() => handleUpdateQty(item._id, item.quantity + 1)}
                    style={{ padding: '6px 10px', background: '#F8FAFC' }}
                  >
                    <Plus size={13} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(item._id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#EF4444',
                  }}
                >
                  <Trash2 size={14} />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Coupons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Coupon Box */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid #F1F5F9',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Tag size={18} color="#2563EB" />
              <h3 style={{ fontSize: '15px', fontWeight: 800 }}>Apply Promo Coupon</h3>
            </div>

            {cart.coupon ? (
              <div
                style={{
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  borderRadius: '12px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#065F46' }}>
                    {cart.coupon.code}
                  </div>
                  <div style={{ fontSize: '12px', color: '#047857' }}>
                    {cart.coupon.description} (-₹{cart.coupon.discountAmount})
                  </div>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  style={{ fontSize: '12px', fontWeight: 700, color: '#EF4444' }}
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  id="cart-coupon-input"
                  name="couponCode"
                  type="text"
                  aria-label="Promo coupon code"
                  placeholder="Try VIBE50 or WELCOME100"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  style={{
                    flex: '1 1 160px',
                    minWidth: 0,
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                  }}
                />
                <button
                  type="submit"
                  disabled={couponLoading}
                  className="btn-pill-dark"
                  style={{ padding: '10px 18px', fontSize: '13px', flexShrink: 0 }}
                >
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </form>
            )}

            {couponMessage && (
              <p
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  marginTop: '8px',
                  color: couponMessage.isError ? '#EF4444' : '#16A34A',
                }}
              >
                {couponMessage.text}
              </p>
            )}
          </div>

          {/* Price Breakdown */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid #F1F5F9',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '18px', color: '#111827' }}>
              Order Price Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Price ({cart.itemCount} items)</span>
                <span style={{ fontWeight: 600 }}>₹{cart.subtotal.toLocaleString('en-IN')}</span>
              </div>

              {cart.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A' }}>
                  <span>Coupon Discount</span>
                  <span style={{ fontWeight: 700 }}>-₹{cart.discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Delivery Charges</span>
                <span style={{ fontWeight: 700, color: cart.shippingFee === 0 ? '#16A34A' : '#111827' }}>
                  {cart.shippingFee === 0 ? 'FREE' : `₹${cart.shippingFee}`}
                </span>
              </div>

              <div
                style={{
                  borderTop: '1px dashed #CBD5E1',
                  margin: '8px 0',
                }}
              />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#111827',
                }}
              >
                <span>Total Amount</span>
                <span>₹{cart.totalAmount.toLocaleString('en-IN')}</span>
              </div>

              {cart.savings > 0 && (
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#16A34A' }}>
                  🎉 You will save ₹{cart.savings.toLocaleString('en-IN')} on this order!
                </p>
              )}
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="btn-pill-dark"
              style={{
                width: '100%',
                marginTop: '24px',
                padding: '14px',
                justifyContent: 'center',
                fontSize: '15px',
              }}
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
