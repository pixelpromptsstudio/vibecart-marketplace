'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { authApi } from '@/lib/api';
import { User, MapPin, Trash2, Plus, CheckCircle, ShieldCheck } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [profileName, setProfileName] = useState('');
  const [phone, setPhone] = useState('');
  const [addresses, setAddresses] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddr, setNewAddr] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
  });

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setPhone(user.phone || '');
      setAddresses(user.addresses || []);
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await authApi.updateProfile({ name: profileName, phone });
      if (res && res.user) {
        updateUser(res.user);
        showToast('success', 'Profile Updated', 'Profile updated successfully!');
      }
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authApi.addAddress({ ...newAddr, isDefault: addresses.length === 0 });
      if (res && res.addresses) {
        setAddresses(res.addresses);
        updateUser({ addresses: res.addresses });
        setShowAddressModal(false);
        setNewAddr({ fullName: '', phone: '', street: '', city: '', state: '', postalCode: '' });
      }
    } catch (err: any) {
      showToast('error', 'Address Error', err.message || 'Failed to add address');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await authApi.deleteAddress(id);
      if (res && res.addresses) {
        setAddresses(res.addresses);
        updateUser({ addresses: res.addresses });
      }
    } catch (err: any) {
      showToast('error', 'Address Error', err.message || 'Failed to remove address');
    }
  };

  return (
    <div className="container" style={{ padding: '36px 24px', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', marginBottom: '28px' }}>
        Profile &amp; Saved Addresses
      </h1>

      {/* Profile Details Form */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '28px',
          border: '1px solid #F1F5F9',
          marginBottom: '28px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
            alt=""
            style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{user?.name}</h3>
            <p style={{ fontSize: '13px', color: '#64748B' }}>{user?.email}</p>
            <span
              style={{
                display: 'inline-block',
                marginTop: '4px',
                fontSize: '10px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '9999px',
                background: '#EEF2FF',
                color: '#4F46E5',
              }}
            >
              ROLE: {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile}>
          <div className="form-grid-2" style={{ marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                Full Name
              </label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px' }}
              />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-pill-dark" style={{ fontSize: '13px', padding: '10px 20px' }}>
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>

      {/* Addresses Section */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '28px',
          border: '1px solid #F1F5F9',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={20} color="#2563EB" />
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Saved Delivery Addresses</h3>
          </div>
          <button
            onClick={() => setShowAddressModal(true)}
            className="btn-pill-dark"
            style={{ padding: '8px 16px', fontSize: '12px' }}
          >
            <Plus size={14} />
            <span>Add Address</span>
          </button>
        </div>

        {addresses.length === 0 ? (
          <p style={{ color: '#64748B', fontSize: '14px' }}>No addresses saved yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {addresses.map((addr) => (
              <div
                key={addr._id}
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#F8FAFC',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#111827' }}>
                    {addr.fullName} <span style={{ fontWeight: 500, color: '#64748B' }}>({addr.phone})</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#4B5563', marginTop: '4px' }}>
                    {addr.street}, {addr.city}, {addr.state} - {addr.postalCode}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteAddress(addr._id)}
                  style={{ color: '#EF4444', padding: '6px' }}
                  title="Remove Address"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>Add New Address</h3>
            <form onSubmit={handleAddAddress}>
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
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Phone</label>
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
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Street</label>
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
                  onClick={() => setShowAddressModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', background: '#F1F5F9', fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-pill-dark" style={{ padding: '8px 20px', fontSize: '13px' }}>
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
