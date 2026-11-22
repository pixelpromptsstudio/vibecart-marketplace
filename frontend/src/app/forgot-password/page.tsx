'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, KeyRound, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authApi } from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'REQUEST' | 'RESET' | 'DONE'>('REQUEST');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await authApi.forgotPassword(email.trim());
      setInfoMessage(
        res?.message ||
          'If that email exists in our system, password reset instructions have been dispatched.'
      );
      if (res?.resetToken) {
        setToken(res.resetToken);
      }
      setStep('RESET');
    } catch (err: any) {
      setError(err.message || 'Could not process reset request.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await authApi.resetPassword(token.trim(), newPassword);
      setInfoMessage(res?.message || 'Password updated successfully.');
      setStep('DONE');
    } catch (err: any) {
      setError(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '60px 20px', minHeight: '72vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          padding: '34px 28px',
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.06)',
        }}
      >
        <Link
          href="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#2563EB',
            marginBottom: '18px',
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={15} /> Back to Sign In
        </Link>

        <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0F172A', margin: '0 0 6px' }}>
          Reset Your Password
        </h1>
        <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 22px', lineHeight: 1.5 }}>
          {step === 'REQUEST'
            ? 'Enter your account email address to request a 15-minute reset token.'
            : step === 'RESET'
              ? 'Paste your reset token and choose a strong new password.'
              : 'Your password has been updated. You can now sign in with your new credentials.'}
        </p>

        {error && (
          <div
            role="alert"
            style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#B91C1C',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        {infoMessage && step !== 'REQUEST' && (
          <div
            style={{
              background: '#ECFDF5',
              border: '1px solid #A7F3D0',
              color: '#065F46',
              borderRadius: '10px',
              padding: '10px 12px',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '16px',
            }}
          >
            {infoMessage}
          </div>
        )}

        {step === 'REQUEST' && (
          <form onSubmit={handleRequestReset} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label
                htmlFor="forgot-email"
                style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}
              >
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="forgot-email"
                  type="email"
                  required
                  autoComplete="email"
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
                <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-pill-dark"
              style={{ width: '100%', padding: '13px', justifyContent: 'center', fontSize: '14px' }}
            >
              {loading ? 'Sending Reset Request...' : 'Send Reset Token'}
            </button>
          </form>
        )}

        {step === 'RESET' && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label
                htmlFor="reset-token"
                style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}
              >
                Reset Token
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reset-token"
                  type="text"
                  required
                  placeholder="Paste reset token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 38px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '13px',
                  }}
                />
                <KeyRound size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              </div>
            </div>

            <div>
              <label
                htmlFor="reset-new-password"
                style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}
              >
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reset-new-password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 38px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                  }}
                />
                <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              </div>
            </div>

            <div>
              <label
                htmlFor="reset-confirm-password"
                style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}
              >
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="reset-confirm-password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 38px',
                    borderRadius: '12px',
                    border: '1px solid #CBD5E1',
                    fontSize: '14px',
                  }}
                />
                <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-pill-dark"
              style={{ width: '100%', padding: '13px', justifyContent: 'center', fontSize: '14px', marginTop: '4px' }}
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        )}

        {step === 'DONE' && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <CheckCircle2 size={44} color="#10B981" style={{ margin: '0 auto 14px' }} />
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="btn-pill-dark"
              style={{ width: '100%', padding: '13px', justifyContent: 'center', fontSize: '14px' }}
            >
              Proceed to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
