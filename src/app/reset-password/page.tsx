'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const labelStyle: React.CSSProperties = {
  display:       'block',
  fontSize:      '0.75rem',
  fontWeight:    600,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color:         'var(--on-surface-muted)',
  marginBottom:  '0.4rem',
};

function ResetPasswordForm() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const token         = searchParams.get('token') ?? '';

  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd1,        setShowPwd1]        = useState(false);
  const [showPwd2,        setShowPwd2]        = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');
  const [success,         setSuccess]         = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch('/api/auth/reset-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message ?? 'Something went wrong.');
      } else {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 2500);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ width: '3.5rem', height: '3.5rem', backgroundColor: 'var(--error-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1rem', color: 'var(--destructive)', fontWeight: 700 }}>
          ✕
        </div>
        <p style={{ color: 'var(--destructive)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Invalid Reset Link
        </p>
        <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          This link is invalid or has expired. Please request a new one.
        </p>
        <Link href="/forgot-password" style={{ color: 'var(--brand-gold)', fontWeight: 600, textDecoration: 'none' }}>
          Request new link →
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ width: '3.5rem', height: '3.5rem', backgroundColor: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1rem', color: 'var(--on-success)', fontWeight: 700 }}>
          ✓
        </div>
        <p style={{ color: 'var(--foreground)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Password Updated!
        </p>
        <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.875rem' }}>
          Redirecting to login…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={labelStyle}>New Password</label>
        <div style={{ position: 'relative' }}>
          <Input
            type={showPwd1 ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min. 8 characters"
            required
            autoFocus
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPwd1((v) => !v)}
            style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-muted)' }}
            aria-label={showPwd1 ? 'Hide password' : 'Show password'}
          >
            {showPwd1 ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Confirm Password</label>
        <div style={{ position: 'relative' }}>
          <Input
            type={showPwd2 ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat password"
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPwd2((v) => !v)}
            style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-muted)' }}
            aria-label={showPwd2 ? 'Hide password' : 'Show password'}
          >
            {showPwd2 ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.875rem', backgroundColor: 'var(--error-bg)', border: '1px solid var(--on-error)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <span style={{ color: 'var(--destructive)', fontSize: '1.125rem', fontWeight: 700, lineHeight: 1 }}>⚠</span>
          <p style={{ fontSize: '0.8125rem', color: 'var(--on-error)', margin: 0, lineHeight: 1.5, flex: 1 }}>{error}</p>
        </div>
      )}

      <Button type="submit" className="w-full tracking-widest uppercase" disabled={loading}>
        {loading ? 'Updating…' : 'Set New Password'}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background)', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        <Link href="/" style={{ textAlign: 'center', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--brand-dark)' }}>
            Ishtile
          </span>
        </Link>

        <div style={{ backgroundColor: 'var(--surface)', padding: '2rem', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid var(--border)' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
            Reset Password
          </h1>
          <Suspense>
            <ResetPasswordForm />
          </Suspense>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--on-surface-muted)' }}>
          Remember your password?{' '}
          <Link href="/login" style={{ color: 'var(--brand-gold)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}
