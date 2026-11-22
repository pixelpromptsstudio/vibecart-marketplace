'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { sellerApi } from '@/lib/api';
import { Store, CheckCircle, ArrowRight } from 'lucide-react';

export default function SellerRegisterPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [businessName, setBusinessName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [bankName, setBankName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await sellerApi.register({
        businessName,
        storeName,
        phone,
        description,
        businessAddress,
        bankDetails: {
          accountNumber,
          ifscCode,
          bankName,
        },
      });
      setSuccess(true);
      setTimeout(() => router.push('/seller/dashboard'), 2000);
    } catch (err: any) {
      showToast('error', 'Registration Failed', err.message || 'Failed to register seller account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '60px 24px', maxWidth: '640px' }}>
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '36px',
          border: '1px solid #F1F5F9',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#ECFDF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto',
              color: '#15803D',
            }}
          >
            <Store size={28} />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#111827' }}>
            Become a VibeCart Seller
          </h1>
          <p style={{ color: '#64748B', fontSize: '14px' }}>
            Sell your style to millions of engaged customers across India.
          </p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <CheckCircle size={48} color="#16A34A" style={{ margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>Store Registered Successfully!</h3>
            <p style={{ color: '#64748B' }}>Redirecting to your Seller Dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  Registered Business Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Lifestyle Ltd"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  Public Store Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Fashion Hub"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1' }}
                />
              </div>
            </div>

            <div className="form-grid-2">
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  Business Contact Phone
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                  Warehouse / Business City
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mumbai, Maharashtra"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>
                Store Bio &amp; Product Specialties
              </label>
              <textarea
                rows={3}
                placeholder="Describe what unique products you offer..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1' }}
              />
            </div>

            {/* Bank Details for payouts */}
            <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '10px' }}>Payout Bank Account Details</h4>
              <div className="form-grid-3">
                <input
                  type="text"
                  placeholder="Bank Account Number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
                <input
                  type="text"
                  placeholder="IFSC Code"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value)}
                  style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
                <input
                  type="text"
                  placeholder="Bank Name"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-pill-dark"
              style={{
                padding: '14px',
                justifyContent: 'center',
                fontSize: '15px',
                marginTop: '10px',
                background: '#D4FF00',
                color: '#111827',
                fontWeight: 800,
              }}
            >
              <span>{loading ? 'Submitting Application...' : 'Register & Launch Store'}</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
