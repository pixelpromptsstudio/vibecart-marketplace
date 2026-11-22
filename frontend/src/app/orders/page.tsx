'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ArrowRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { orderApi } from '@/lib/api';
import { VibeLoader } from '@/components/VibeLoader';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi
      .getCustomerOrders()
      .then((res) => {
        if (res && res.orders) setOrders(res.orders);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return { bg: '#DCFCE7', text: '#15803D' };
      case 'CANCELLED':
        return { bg: '#FEE2E2', text: '#B91C1C' };
      case 'SHIPPED':
      case 'OUT_FOR_DELIVERY':
        return { bg: '#E0F2FE', text: '#0369A1' };
      default:
        return { bg: '#FEF3C7', text: '#B45309' };
    }
  };

  return (
    <div className="container" style={{ padding: '36px 24px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', marginBottom: '24px' }}>
        My Orders ({orders.length})
      </h1>

      {loading ? (
        <VibeLoader label="Retrieving Your Orders..." />
      ) : orders.length === 0 ? (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '60px 20px',
            textAlign: 'center',
            border: '1px solid #F1F5F9',
          }}
        >
          <div
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: '#F1F5F9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              color: '#94A3B8',
            }}
          >
            <Package size={34} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>No orders yet</h3>
          <p style={{ color: '#64748B', marginBottom: '20px' }}>
            Start exploring our collections and discover what fits your vibe.
          </p>
          <Link href="/" className="btn-pill-dark">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map((order) => {
            const statusStyle = getStatusColor(order.status);
            return (
              <div
                key={order._id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  padding: '24px',
                  border: '1px solid #F1F5F9',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                }}
              >
                {/* Order Top Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #F1F5F9',
                    paddingBottom: '16px',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>
                      ORDER #{order.orderNumber}
                    </span>
                    <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 800,
                        padding: '4px 12px',
                        borderRadius: '9999px',
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.text,
                      }}
                    >
                      {order.status}
                    </span>

                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </span>

                    <Link
                      href={`/orders/${order.orderNumber || order._id}`}
                      className="btn-pill-dark"
                      style={{ padding: '8px 16px', fontSize: '13px' }}
                    >
                      <span>Track Order</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>

                {/* Items preview */}
                <div style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {order.items.map((it: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: '#F8FAFC',
                        padding: '8px 12px',
                        borderRadius: '12px',
                        flexShrink: 0,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={it.image}
                        alt={it.name}
                        style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                      />
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: 700, maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {it.name}
                        </p>
                        <p style={{ fontSize: '11px', color: '#64748B' }}>
                          Qty: {it.quantity} • ₹{it.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
