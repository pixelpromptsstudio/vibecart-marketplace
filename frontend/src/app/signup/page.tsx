'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, User as UserIcon, Phone } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'SELLER'>('CUSTOMER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await register({ name, email, phone, password, role });
      if (role === 'SELLER') {
        router.push('/seller/register');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '60px 24px', maxWidth: '480px' }}>
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '36px',
          border: '1px solid #F1F5F9',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="logo-v-mark" style={{ margin: '0 auto 12px auto' }}>V</div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827' }}>Create Your Account</h1>
          <p style={{ color: '#64748B', fontSize: '13px' }}>Join VibeCart to shop or start selling</p>
        </div>

        {error && (
          <div
            style={{
              background: '#FEE2E2',
              color: '#B91C1C',
              padding: '10px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              marginBottom: '16px',
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                placeholder="Dhruv Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 38px',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  fontSize: '14px',
                }}
              />
              <UserIcon size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '15px' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 38px',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  fontSize: '14px',
                }}
              />
              <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '15px' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
              Phone Number
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 38px',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  fontSize: '14px',
                }}
              />
              <Phone size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '15px' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 38px',
                  borderRadius: '12px',
                  border: '1px solid #CBD5E1',
                  fontSize: '14px',
                }}
              />
              <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '15px' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
              I want to:
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <label
                style={{
                  flex: 1,
                  border: role === 'CUSTOMER' ? '2px solid #111827' : '1px solid #CBD5E1',
                  padding: '10px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  fontWeight: role === 'CUSTOMER' ? 800 : 500,
                  fontSize: '13px',
                }}
              >
                <input
                  type="radio"
                  name="role"
                  checked={role === 'CUSTOMER'}
                  onChange={() => setRole('CUSTOMER')}
                  style={{ display: 'none' }}
                />
                Shop on VibeCart
              </label>

              <label
                style={{
                  flex: 1,
                  border: role === 'SELLER' ? '2px solid #111827' : '1px solid #CBD5E1',
                  padding: '10px',
                  borderRadius: '10px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  fontWeight: role === 'SELLER' ? 800 : 500,
                  fontSize: '13px',
                }}
              >
                <input
                  type="radio"
                  name="role"
                  checked={role === 'SELLER'}
                  onChange={() => setRole('SELLER')}
                  style={{ display: 'none' }}
                />
                Sell My Style
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-pill-dark"
            style={{
              width: '100%',
              padding: '14px',
              justifyContent: 'center',
              fontSize: '15px',
              marginTop: '10px',
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ fontSize: '13px', color: '#64748B', textAlign: 'center', marginTop: '24px' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ fontWeight: 800, color: '#111827' }}>
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}
