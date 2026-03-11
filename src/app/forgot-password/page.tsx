'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email,     setEmail]     = useState('');
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res  = await fetch('/api/auth/forgot-password', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (!res.ok && !data.success) {
        setError(data.message ?? 'Something went wrong. Please try again.');
      } else {
        setSubmitted(true);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight:       '100vh',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        backgroundColor: 'var(--background)',
        padding:         '2rem 1rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>

        {/* Logo */}
        <Link href="/" style={{ textAlign: 'center', textDecoration: 'none' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--brand-dark)' }}>
            Ishtile
          </span>
        </Link>

        {/* Card */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            borderRadius:    '1rem',
            padding:         '2rem',
            display:         'flex',
            flexDirection:   'column',
            gap:             '1.25rem',
            boxShadow:       '0 2px 12px rgba(0,0,0,0.06)',
          }}
        >
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Forgot Password</h1>

          {submitted ? (
            <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-muted)', lineHeight: 1.6 }}>
              If an account with that email exists, a reset link has been sent. Please check your inbox.
            </p>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--on-surface-muted)' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={{
                    width:        '100%',
                    padding:      '0.6rem 0.75rem',
                    border:       '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    fontSize:     '0.9rem',
                    background:   'var(--background)',
                    color:        'var(--foreground)',
                    boxSizing:    'border-box',
                    outline:      'none',
                  }}
                />
              </div>

              {error && (
                <p style={{ fontSize: '0.8rem', color: '#ef4444', margin: 0 }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width:         '100%',
                  padding:       '0.65rem',
                  background:    'var(--brand-dark)',
                  color:         '#fff',
                  border:        'none',
                  borderRadius:  '0.5rem',
                  fontSize:      '0.85rem',
                  fontWeight:    700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor:        loading ? 'not-allowed' : 'pointer',
                  opacity:       loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <p style={{ fontSize: '0.8rem', textAlign: 'center', color: 'var(--on-surface-muted)', margin: 0 }}>
            Remember your password?{' '}
            <Link href="/login" style={{ color: 'var(--brand-dark)', fontWeight: 600, textDecoration: 'none' }}>
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
