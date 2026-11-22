'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, ArrowRight, Sparkles, LogOut } from 'lucide-react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { authApi } from '@/lib/api';
import { isAdminRole } from '@/components/admin/adminHelpers';

export default function AdminPortalLoginPage() {
  const router = useRouter();
  const { user, isLoading, login, quickSwitchRole, logout } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && user && isAdminRole(user.role)) {
      router.replace('/admin/dashboard');
    }
  }, [isLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await login(email.trim(), password);
      const me = await authApi.getMe();
      const role = me?.user?.role;
      if (!isAdminRole(role)) {
        logout();
        setError('Access denied: This account does not have Administrator or Manager privileges.');
        return;
      }
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Check your admin credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoAdmin = async (role: UserRole) => {
    try {
      setSubmitting(true);
      setError(null);
      await quickSwitchRole(role);
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Quick access failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-screen">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-login-badge">
            <ShieldCheck size={20} color="#60A5FA" />
            <span>VIBECART OPERATIONS COMMAND</span>
          </div>
          <h1 className="admin-login-title">Admin Portal Sign In</h1>
          <p className="admin-login-subtitle">
            Dedicated administrative interface to manage orders, sellers, product moderation, coupons &amp; system logs.
          </p>
        </div>

        {user && !isAdminRole(user.role) && (
          <div className="admin-warning-banner">
            <div>
              <strong>Currently signed in as {user.role}:</strong> {user.email}. Switch to an Administrator account below.
            </div>
            <button
              type="button"
              onClick={logout}
              className="admin-btn-xs"
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        )}

        {error && (
          <div className="admin-error-banner" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="admin-email" className="admin-form-label">
              Admin Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="admin@vibecart.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="admin-form-input with-icon"
              />
              <Mail size={16} color="#94A3B8" className="admin-input-icon" />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className="admin-form-label">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-form-input with-icon"
              />
              <Lock size={16} color="#94A3B8" className="admin-input-icon" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="admin-login-submit"
          >
            <span>{submitting ? 'Authenticating...' : 'Enter Command Center'}</span>
            <ArrowRight size={17} />
          </button>
        </form>

        {process.env.NODE_ENV !== 'production' && (
          <div className="admin-demo-box">
            <div className="admin-demo-heading">
              <Sparkles size={13} color="#F59E0B" />
              <span>DEMO SANDBOX QUICK ACCESS</span>
            </div>
            <div className="admin-demo-grid">
              {[
                { role: 'SUPER_ADMIN' as UserRole, label: 'Super Admin' },
                { role: 'ADMIN' as UserRole, label: 'Operations Admin' },
                { role: 'MANAGER' as UserRole, label: 'Catalog Manager' },
              ].map((item) => (
                <button
                  key={item.role}
                  type="button"
                  disabled={submitting}
                  onClick={() => handleDemoAdmin(item.role)}
                  className="admin-demo-btn"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="admin-login-footer">
          <Link href="/" className="admin-back-store">
            ← Return to VibeCart Storefront
          </Link>
          <Link href="/forgot-password" className="admin-back-store">
            Reset Password
          </Link>
        </div>
      </div>
    </div>
  );
}
