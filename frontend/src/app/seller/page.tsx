'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Store, TrendingUp, ShieldCheck, Truck, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SellerLandingPage() {
  const router = useRouter();
  const { user, quickSwitchRole } = useAuth();

  useEffect(() => {
    if (user?.role === 'SELLER') {
      router.replace('/seller/dashboard');
    }
  }, [user, router]);

  const handleDemoSeller = async () => {
    await quickSwitchRole('SELLER');
    router.push('/seller/dashboard');
  };

  return (
    <div style={{ backgroundColor: '#F1F5F9', minHeight: '80vh', padding: '48px 24px' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Hero Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1E3A8A 0%, #2874F0 100%)',
            borderRadius: '24px',
            padding: '48px 36px',
            color: '#FFFFFF',
            textAlign: 'center',
            marginBottom: '32px',
            boxShadow: '0 12px 30px rgba(40, 116, 240, 0.25)',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 800,
              marginBottom: '16px',
            }}
          >
            <Sparkles size={14} color="#FFD700" />
            <span>VibeCart Seller Central</span>
          </div>

          <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.5px' }}>
            Sell Your Style to Millions of Shoppers
          </h1>
          <p style={{ fontSize: '16px', color: '#E0E7FF', maxWidth: '600px', margin: '0 auto 28px auto', lineHeight: 1.6 }}>
            Join thousands of verified vendors growing their brand on VibeCart with seamless logistics, 7-day payouts, and direct customer reach.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link
              href="/seller/register"
              style={{
                background: '#FFD700',
                color: '#111827',
                padding: '14px 28px',
                borderRadius: '9999px',
                fontWeight: 800,
                fontSize: '15px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(255, 215, 0, 0.4)',
              }}
            >
              <span>Register Your Store</span>
              <ArrowRight size={18} />
            </Link>

            <button
              onClick={handleDemoSeller}
              style={{
                background: '#FFFFFF',
                color: '#2874F0',
                padding: '14px 24px',
                borderRadius: '9999px',
                fontWeight: 800,
                fontSize: '14px',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Store size={18} />
              <span>Explore as Demo Seller (ElectroVibe)</span>
            </button>
          </div>
        </div>

        {/* Perks Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <TrendingUp size={24} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>0% Commission</h3>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
              Enjoy zero commission on your first 30 days of sales across all primary marketplace categories.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>7-Day Fast Payouts</h3>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
              Get automatic weekly payouts directly into your verified bank account with transparent accounting.
            </p>
          </div>

          <div style={{ background: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
              <Truck size={24} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>Pan-India Fulfillment</h3>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
              Deliver to 19,000+ pincodes with VibeCart logistics network and real-time shipping tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
