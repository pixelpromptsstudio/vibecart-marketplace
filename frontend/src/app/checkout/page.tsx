'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  CreditCard,
  CheckCircle,
  Truck,
  Plus,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { cartApi, orderApi, authApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { VibeLoader } from '@/components/VibeLoader';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, refreshCartCount } = useAuth();
  const { showToast } = useToast();

  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'UPI' | 'CARD'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [showNewAddressModal, setShowNewAddressModal] = useState(false);

  // New address fields
  const [newAddr, setNewAddr] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
  });

  useEffect(() => {
    const initCheckout = async () => {
      try {
        setLoading(true);
        const [cartRes, userRes] = await Promise.all([
          cartApi.getCart(),
          authApi.getMe().catch(() => null),
        ]);

        if (cartRes && cartRes.cart) {
          setCart(cartRes.cart);
        }

        if (userRes && userRes.user && userRes.user.addresses) {
          setAddresses(userRes.user.addresses);
        } else if (user && user.addresses) {
          setAddresses(user.addresses);
        }
      } catch (err) {
        console.error('Checkout init error:', err);
      } finally {
        setLoading(false);
      }
    };

    initCheckout();
  }, [user]);

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authApi.addAddress({ ...newAddr, isDefault: true });
      if (res && res.addresses) {
        setAddresses(res.addresses);
        setSelectedAddressIndex(res.addresses.length - 1);
        setShowNewAddressModal(false);
        showToast('success', 'Address Saved', 'New delivery address added successfully.');
      }
    } catch (err: any) {
      showToast('error', 'Address Error', err.message || 'Failed to save address');
    }
  };

  const handlePlaceOrder = async () => {
    if (submittingRef.current) return;

    if (addresses.length === 0) {
      showToast('info', 'Address Required', 'Please add a delivery address to place your order.');
      setShowNewAddressModal(true);
      return;
    }

    const shippingAddress = addresses[selectedAddressIndex];

    try {
      submittingRef.current = true;
      setIsSubmitting(true);
      const res = await orderApi.createOrder({
        shippingAddress,
        paymentMethod,
        paymentDetails:
          paymentMethod !== 'COD'
            ? {
                gatewayOrderId: `gateway_vibe_${Date.now()}`,
                paymentId: `pay_mock_${Date.now()}`,
                signature: 'test_verified',
              }
            : undefined,
      });

      if (res && res.order) {
        await refreshCartCount();
        showToast('success', 'Order Confirmed! 🎉', `Order #${res.order.orderNumber} placed successfully.`);
        router.push(`/orders/${res.order.orderNumber || res.order._id}`);
      }
    } catch (err: any) {
      showToast('error', 'Order Failed', err.message || 'Failed to place order');
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <VibeLoader label="Securing Checkout..." size="lg" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Your Cart is Empty</h2>
        <Link href="/" className="btn-pill-dark">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '36px 24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', marginBottom: '28px' }}>
        Checkout &amp; Payment
      </h1>

      <div className="checkout-split-grid">
        {/* Left Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Step 1: Address */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '28px',
              border: '1px solid #F1F5F9',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin size={20} color="#2563EB" />
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>1. Delivery Address</h3>
              </div>
              <button
                onClick={() => setShowNewAddressModal(true)}
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Plus size={16} /> Add New Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <p style={{ color: '#64748B', fontSize: '14px' }}>
                No address saved yet. Please add a shipping address.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {addresses.map((addr, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedAddressIndex(idx)}
                    style={{
                      border: selectedAddressIndex === idx ? '2px solid #111827' : '1px solid #E2E8F0',
                      borderRadius: '14px',
                      padding: '16px',
                      cursor: 'pointer',
                      background: selectedAddressIndex === idx ? '#F8FAFC' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                    }}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressIndex === idx}
                      onChange={() => setSelectedAddressIndex(idx)}
                      style={{ marginTop: '4px' }}
                    />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#111827' }}>
                        {addr.fullName} <span style={{ fontWeight: 500, color: '#64748B' }}>({addr.phone})</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#4B5563', marginTop: '4px' }}>
                        {addr.street}, {addr.city}, {addr.state} - {addr.postalCode}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '28px',
              border: '1px solid #F1F5F9',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <CreditCard size={20} color="#2563EB" />
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>2. Select Payment Option</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { id: 'COD', label: 'Cash on Delivery (COD)', desc: 'Pay with cash or UPI at doorstep' },
                { id: 'UPI', label: 'Instant UPI (Google Pay, PhonePe, Paytm)', desc: 'Fast, secure, 1-click verification' },
                { id: 'CARD', label: 'Credit / Debit Card / NetBanking', desc: 'Encrypted and protected with 3D Secure' },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setPaymentMethod(opt.id as any)}
                  style={{
                    border: paymentMethod === opt.id ? '2px solid #111827' : '1px solid #E2E8F0',
                    borderRadius: '14px',
                    padding: '16px',
                    cursor: 'pointer',
                    background: paymentMethod === opt.id ? '#F8FAFC' : '#FFFFFF',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === opt.id}
                    onChange={() => setPaymentMethod(opt.id as any)}
                    style={{ marginTop: '4px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#111827' }}>{opt.label}</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{opt.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Summary */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            border: '1px solid #F1F5F9',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px' }}>Order Items ({cart.itemCount})</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {cart.items.map((it: any) => (
              <div key={it._id} style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '13px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.image} alt="" style={{ width: '40px', height: '40px', objectFit: 'contain', borderRadius: '6px' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {it.name}
                  </div>
                  <span style={{ color: '#64748B', fontSize: '11px' }}>Qty: {it.quantity}</span>
                </div>
                <span style={{ fontWeight: 700 }}>₹{it.subtotal.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
              <span>Subtotal</span>
              <span>₹{cart.subtotal.toLocaleString('en-IN')}</span>
            </div>

            {cart.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A' }}>
                <span>Coupon Discount</span>
                <span>-₹{cart.discount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
              <span>Shipping Fee</span>
              <span style={{ fontWeight: 700, color: cart.shippingFee === 0 ? '#16A34A' : '#111827' }}>
                {cart.shippingFee === 0 ? 'FREE' : `₹${cart.shippingFee}`}
              </span>
            </div>

            <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800, color: '#111827' }}>
              <span>Total Payable</span>
              <span>₹{cart.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className="btn-pill-dark"
            style={{
              width: '100%',
              marginTop: '24px',
              padding: '14px',
              justifyContent: 'center',
              fontSize: '15px',
            }}
          >
            <span>{isSubmitting ? 'Placing Order...' : 'Confirm & Place Order'}</span>
          </button>
        </div>
      </div>

      {/* Add New Address Modal */}
      {showNewAddressModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Add Shipping Address</h3>
            <form onSubmit={handleAddNewAddress}>
              <div className="form-grid-2" style={{ marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={newAddr.fullName}
                    onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Street Address / Flat No.</label>
                <input
                  type="text"
                  required
                  value={newAddr.street}
                  onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div className="form-grid-3" style={{ marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>City</label>
                  <input
                    type="text"
                    required
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>State</label>
                  <input
                    type="text"
                    required
                    value={newAddr.state}
                    onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Pincode</label>
                  <input
                    type="text"
                    required
                    value={newAddr.postalCode}
                    onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowNewAddressModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', background: '#F1F5F9', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-pill-dark"
                  style={{ padding: '8px 20px', fontSize: '13px' }}
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
