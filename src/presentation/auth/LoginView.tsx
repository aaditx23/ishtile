'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import OtpLoginForm from './components/OtpLoginForm';
import PasswordLoginForm from './components/PasswordLoginForm';

type Tab = 'otp' | 'password';

const tabStyle = (active: boolean): React.CSSProperties => ({
  flex:          1,
  padding:       '0.625rem 0',
  fontSize:      '0.75rem',
  fontWeight:    600,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  cursor:        'pointer',
  border:        'none',
  background:    'none',
  borderBottom:  active ? `2px solid var(--brand-gold)` : '2px solid transparent',
  color:         active ? 'var(--on-background)' : 'var(--on-surface-muted)',
  transition:    'all 0.15s ease',
});

export default function LoginView() {
  const [tab, setTab] = useState<Tab>('otp');

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
            Ishtyle
          </span>
        </Link>

        {/* Card */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            borderRadius:    '1rem',
            padding:         '2rem',
            boxShadow:       '0 2px 16px rgba(0,0,0,0.06)',
            border:          '1px solid var(--border)',
          }}
        >
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
            Sign In
          </h1>

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '1.5rem' }}>
            <button style={tabStyle(tab === 'otp')}      onClick={() => setTab('otp')}>      OTP Login   </button>
            <button style={tabStyle(tab === 'password')} onClick={() => setTab('password')}> Password    </button>
          </div>

          {/* Forms — wrapped in Suspense because they use useSearchParams */}
          <Suspense>
            {tab === 'otp'      && <OtpLoginForm />}
            {tab === 'password' && <PasswordLoginForm />}
          </Suspense>
        </div>

        {/* Footer link */}
        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--on-surface-muted)' }}>
          New to Ishtyle?{' '}
          <Link href="/register" style={{ color: 'var(--brand-gold)', fontWeight: 600, textDecoration: 'none' }}>
            Create an account →
          </Link>
        </p>
      </div>
    </div>
  );
}
