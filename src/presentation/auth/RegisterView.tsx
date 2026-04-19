'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { addToCart } from '@/application/cart/addToCart';
import { authConvexService } from '@/infrastructure/auth/auth.service';

const labelStyle: React.CSSProperties = {
  display:       'block',
  fontSize:      '0.75rem',
  fontWeight:    600,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color:         'var(--on-surface-muted)',
  marginBottom:  '0.4rem',
};

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/';
  const pendingAddToCart = searchParams.get('addToCart') === '1';
  const pendingVariantId = searchParams.get('variantId');
  const pendingQty = Number(searchParams.get('qty') ?? '1');

  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [loading, setLoading]     = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address.');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authConvexService.register({
        email,
        password,
      });

      if (pendingAddToCart && pendingVariantId) {
        const safeQty = Number.isFinite(pendingQty) && pendingQty > 0 ? Math.floor(pendingQty) : 1;
        await addToCart(pendingVariantId as unknown as number, safeQty);
        toast.success('Added to cart!');
      }

      toast.success('Account created! Welcome to Ishtile.');
      router.push(next);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={labelStyle}>Email</label>
        <Input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
          required
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
      </div>

      <div>
        <label style={labelStyle}>Confirm Password</label>
        <Input
          type={showPwd ? 'text' : 'password'}
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full tracking-widest uppercase" disabled={loading}>
        {loading ? 'Creating account…' : 'Create Account'}
      </Button>
    </form>
  );
}

function LoginLink() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next');
  const pendingAddToCart = searchParams.get('addToCart') === '1';
  const pendingVariantId = searchParams.get('variantId');
  const pendingQty = searchParams.get('qty');

  const loginParams = new URLSearchParams();
  if (next) loginParams.set('next', next);
  if (pendingAddToCart) {
    loginParams.set('addToCart', '1');
    if (pendingVariantId) loginParams.set('variantId', pendingVariantId);
    if (pendingQty) loginParams.set('qty', pendingQty);
  }
  const loginUrl = loginParams.toString() ? `/login?${loginParams.toString()}` : '/login';
  
  return (
    <Link href={loginUrl} style={{ color: 'var(--brand-gold)', fontWeight: 600, textDecoration: 'none' }}>
      Sign in →
    </Link>
  );
}

export default function RegisterView() {
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
            Create Account
          </h1>
          <Suspense>
            <RegisterForm />
          </Suspense>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--on-surface-muted)' }}>
          Already have an account?{' '}
          <Suspense>
            <LoginLink />
          </Suspense>
        </p>
      </div>
    </div>
  );
}
