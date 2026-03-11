'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { authConvexService } from '@/infrastructure/auth/authConvex.service';

const labelStyle: React.CSSProperties = {
  display:       'block',
  fontSize:      '0.75rem',
  fontWeight:    600,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color:         'var(--on-surface-muted)',
  marginBottom:  '0.4rem',
};

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const next         = searchParams.get('next') ?? '/';

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authConvexService.login(email, password);
      toast.success('Welcome back!');
      router.push(next);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Check your credentials.';
      console.error('Login error:', err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={labelStyle}>Phone or Email</label>
        <Input
          type="text"
          placeholder="01XXXXXXXXX or you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
      </div>

      <div>
        <label style={labelStyle}>Password</label>
        <div style={{ position: 'relative' }}>
          <Input
            type={showPwd ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-muted)' }}
            aria-label={showPwd ? 'Hide password' : 'Show password'}
          >
            {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
          </button>
        </div>
        <div style={{ textAlign: 'right', marginTop: '0.35rem' }}>
          <Link href="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--on-surface-muted)', textDecoration: 'none' }}>
            Forgot Password?
          </Link>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full tracking-widest uppercase"
        disabled={loading}
      >
        {loading ? 'Logging in…' : 'Login'}
      </Button>
    </form>
  );
}

export default function LoginView() {
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
            boxShadow:       '0 2px 16px rgba(0,0,0,0.06)',
            border:          '1px solid var(--border)',
          }}
        >
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
            Sign In
          </h1>

          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        {/* Footer link */}
        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--on-surface-muted)' }}>
          New to Ishtile?{' '}
          <Link href="/register" style={{ color: 'var(--brand-gold)', fontWeight: 600, textDecoration: 'none' }}>
            Create an account →
          </Link>
        </p>
      </div>
    </div>
  );
}
