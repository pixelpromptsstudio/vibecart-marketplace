'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Lock, Mail, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, quickSwitchRole } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    try {
      setLoading(true);
      setError(null);
      await quickSwitchRole(role);
      if (['ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(role)) {
        router.push('/admin/dashboard');
      } else if (role === 'SELLER') {
        router.push('/seller/dashboard');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message);
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
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#111827' }}>Welcome Back</h1>
          <p style={{ color: '#64748B', fontSize: '13px' }}>Sign in to continue your shopping vibe</p>
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
            <label htmlFor="login-email" style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label htmlFor="login-password" style={{ fontSize: '12px', fontWeight: 700 }}>
                Password
              </label>
              <Link href="/forgot-password" style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB' }}>
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
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

          <button
            type="submit"
            disabled={loading}
            className="btn-pill-dark"
            style={{
              width: '100%',
              padding: '14px',
              justifyContent: 'center',
              fontSize: '15px',
              marginTop: '8px',
            }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* 1-Click Fast Login for Testing/Demo */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #F1F5F9' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={14} color="#F59E0B" /> ONE-CLICK TEST LOGIN ACCOUNTS:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { role: 'CUSTOMER', label: 'Customer (Dhruv)' },
              { role: 'SELLER', label: 'Seller (ElectroVibe)' },
              { role: 'ADMIN', label: 'Vibe Admin' },
              { role: 'SUPER_ADMIN', label: 'Super Admin' },
            ].map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => handleQuickLogin(acc.role as any)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid #E2E8F0',
                  background: '#F8FAFC',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#1E293B',
                  textAlign: 'center',
                  transition: 'background 0.15s',
                }}
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        <p style={{ fontSize: '13px', color: '#64748B', textAlign: 'center', marginTop: '24px' }}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" style={{ fontWeight: 800, color: '#111827' }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
