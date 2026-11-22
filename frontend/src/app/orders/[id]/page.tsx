'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  CheckCircle,
  Truck,
  MapPin,
  Clock,
  ArrowLeft,
  XCircle,
} from 'lucide-react';
import { orderApi } from '@/lib/api';
import { formatINR } from '@/lib/format';
import { useToast } from '@/context/ToastContext';
import { VibeLoader } from '@/components/VibeLoader';
import { ConfirmDialog } from '@/components/ConfirmDialog';

const ALL_STEPS = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { showToast } = useToast();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    orderApi
      .getOrderById(id)
      .then((res) => {
        if (res && res.order) setOrder(res.order);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancelOrder = () => {
    setCancelConfirmOpen(true);
  };

  const confirmCancelOrder = async () => {
    try {
      setIsCancelling(true);
      const res = await orderApi.cancelOrder(order._id, 'Cancelled by customer.');
      if (res && res.order) {
        setOrder(res.order);
        showToast('info', 'Order Cancelled', 'Your order has been cancelled and refund initiated.');
      }
      setCancelConfirmOpen(false);
    } catch (err: any) {
      showToast('error', 'Cancellation Failed', err.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 20px', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <VibeLoader label="Tracking Your Shipment..." size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>Order Not Found</h2>
        <Link href="/orders" className="btn-pill-dark">Back to Orders</Link>
      </div>
    );
  }

  const currentStepIndex = ALL_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="container" style={{ padding: '36px 24px' }}>
      <Link
        href="/orders"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          fontWeight: 700,
          color: '#64748B',
          marginBottom: '20px',
        }}
      >
        <ArrowLeft size={16} /> Back to My Orders
      </Link>

      {/* Header */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '28px',
          border: '1px solid #F1F5F9',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>
            ORDER TRACKING
          </span>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '4px 0' }}>
            Order #{order.orderNumber}
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B' }}>
            Placed on {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span
            style={{
              padding: '6px 16px',
              borderRadius: '9999px',
              fontWeight: 800,
              fontSize: '13px',
              backgroundColor: isCancelled ? '#FEE2E2' : '#DCFCE7',
              color: isCancelled ? '#B91C1C' : '#15803D',
            }}
          >
            STATUS: {order.status}
          </span>

          {['PENDING', 'CONFIRMED'].includes(order.status) && (
            <button
              onClick={handleCancelOrder}
              disabled={isCancelling}
              style={{
                padding: '8px 16px',
                borderRadius: '9999px',
                border: '1px solid #FCA5A5',
                color: '#EF4444',
                fontSize: '13px',
                fontWeight: 700,
                background: '#FFFFFF',
              }}
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>

      {/* Visual Tracking Progression Bar */}
      {!isCancelled && (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '32px',
            border: '1px solid #F1F5F9',
            marginBottom: '24px',
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '28px' }}>Delivery Progress</h3>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              maxWidth: '800px',
              margin: '0 auto',
            }}
          >
            {/* Progress line */}
            <div
              style={{
                position: 'absolute',
                top: '18px',
                left: '20px',
                right: '20px',
                height: '4px',
                background: '#E2E8F0',
                zIndex: 1,
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: '#111827',
                  width: `${Math.max(0, (currentStepIndex / (ALL_STEPS.length - 1)) * 100)}%`,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>

            {ALL_STEPS.map((step, idx) => {
              const isDone = currentStepIndex >= idx;
              return (
                <div
                  key={step}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 2,
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: isDone ? '#111827' : '#FFFFFF',
                      border: isDone ? 'none' : '2px solid #CBD5E1',
                      color: isDone ? '#FFFFFF' : '#94A3B8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                    }}
                  >
                    {isDone ? <CheckCircle size={18} /> : <Clock size={16} />}
                  </div>
                  <span
                    style={{
                      marginTop: '8px',
                      fontSize: '11px',
                      fontWeight: isDone ? 800 : 500,
                      color: isDone ? '#111827' : '#94A3B8',
                      textTransform: 'capitalize',
                      textAlign: 'center',
                    }}
                  >
                    {step.replace(/_/g, ' ').toLowerCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Details Grid */}
      <ConfirmDialog
        open={cancelConfirmOpen}
        title="Cancel this order?"
        description="Once cancelled, items are restocked and any prepaid amount is refunded to your original payment method."
        confirmLabel="Yes, Cancel Order"
        cancelLabel="Keep Order"
        loading={isCancelling}
        onConfirm={confirmCancelOrder}
        onCancel={() => setCancelConfirmOpen(false)}
      />
      <div className="orders-detail-grid">
        {/* Items */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '28px',
            border: '1px solid #F1F5F9',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>Ordered Items</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {order.items.map((it: any, idx: number) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '16px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid #F1F5F9',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={it.image}
                  alt={it.name}
                  style={{ width: '64px', height: '64px', objectFit: 'contain', borderRadius: '8px', background: '#F8FAFC', flexShrink: 0 }}
                />
                <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{it.name}</h4>
                  <p style={{ fontSize: '12px', color: '#64748B' }}>
                    Quantity: {it.quantity}{' '}
                    {it.variant && !/^[a-f0-9]{24}$/i.test(String(it.variant))
                      ? `• Variant: ${it.variant}`
                      : ''}
                  </p>
                </div>
                <div style={{ textAlign: 'right', marginLeft: 'auto' }}>
                  <div style={{ fontSize: '15px', fontWeight: 800 }}>{formatINR(it.subtotal)}</div>
                  <div style={{ fontSize: '11px', color: '#94A3B8' }}>{formatINR(it.price)} each</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Payment Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Shipping Address */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid #F1F5F9',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <MapPin size={18} color="#2563EB" />
              <h4 style={{ fontSize: '15px', fontWeight: 800 }}>Delivery Address</h4>
            </div>
            <p style={{ fontWeight: 700, fontSize: '13px' }}>{order.shippingAddress.fullName}</p>
            <p style={{ fontSize: '12px', color: '#4B5563', lineHeight: 1.5, marginTop: '4px' }}>
              {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
            </p>
            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Phone: {order.shippingAddress.phone}</p>
          </div>

          {/* Payment Details */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid #F1F5F9',
            }}
          >
            <h4 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '14px' }}>Payment Info</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Method</span>
                <span style={{ fontWeight: 700 }}>{order.paymentInfo.method}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Payment Status</span>
                <span style={{ fontWeight: 700, color: order.paymentInfo.status === 'PAID' ? '#16A34A' : '#F59E0B' }}>
                  {order.paymentInfo.status}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Subtotal</span>
                <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {order.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A' }}>
                  <span>Coupon Discount</span>
                  <span>-₹{order.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800 }}>
                <span>Total</span>
                <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
