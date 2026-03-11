'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function ResetPasswordForm() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const token         = searchParams.get('token') ?? '';

  const [newPassword,     setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      <p style={{ color: '#ef4444', textAlign: 'center', marginTop: 40 }}>
        Invalid reset link. Please request a new one.
      </p>
    );
  }

  if (success) {
    return (
      <p style={{ color: '#22c55e', textAlign: 'center', marginTop: 40 }}>
        Password updated! Redirecting to login…
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h1 style={styles.heading}>Reset Password</h1>

      <label style={styles.label}>New Password</label>
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="Min. 8 characters"
        required
        style={styles.input}
      />

      <label style={styles.label}>Confirm Password</label>
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Repeat password"
        required
        style={styles.input}
      />

      {error && <p style={styles.error}>{error}</p>}

      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? 'Updating…' : 'Set New Password'}
      </button>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    maxWidth:      400,
    margin:        '60px auto',
    padding:       '32px 28px',
    border:        '1px solid #e5e7eb',
    borderRadius:  8,
    fontFamily:    'Arial, sans-serif',
    display:       'flex',
    flexDirection: 'column',
    gap:           12,
  },
  heading: { fontSize: 22, fontWeight: 700, marginBottom: 8, textAlign: 'center' },
  label:   { fontSize: 13, fontWeight: 600, color: '#374151' },
  input:   {
    padding:      '10px 12px',
    border:       '1px solid #d1d5db',
    borderRadius: 4,
    fontSize:     14,
    outline:      'none',
  },
  error:   { color: '#ef4444', fontSize: 13, margin: 0 },
  button:  {
    marginTop:    8,
    padding:      '11px 0',
    background:   '#000',
    color:        '#fff',
    border:       'none',
    borderRadius: 4,
    fontSize:     14,
    fontWeight:   600,
    cursor:       'pointer',
  },
};

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
