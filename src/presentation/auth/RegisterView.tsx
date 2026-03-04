'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { authService } from '@/infrastructure/auth/auth.service';

type Step = 'phone' | 'otp' | 'profile';

const labelStyle: React.CSSProperties = {
  display:       'block',
  fontSize:      '0.75rem',
  fontWeight:    600,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color:         'var(--on-surface-muted)',
  marginBottom:  '0.4rem',
};

const stepLabel = (n: 1|2|3, cur: number) => (
  <span style={{
    display:         'inline-flex',
    alignItems:      'center',
    justifyContent:  'center',
    width:           '1.5rem',
    height:          '1.5rem',
    borderRadius:    '50%',
    fontSize:        '0.7rem',
    fontWeight:      700,
    backgroundColor: cur === n ? 'var(--brand-gold)' : cur > n ? 'var(--brand-dark)' : 'var(--surface-variant)',
    color:           cur >= n ? 'white' : 'var(--on-surface-muted)',
    flexShrink:      0,
  }}>{n}</span>
);

function RegisterForm() {
  const router = useRouter();

  const [step, setStep]     = useState<Step>('phone');
  const [phone, setPhone]   = useState('');
  const [otp, setOtp]       = useState('');
  const [fullName, setFullName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPwd, setShowPwd]     = useState(false);
  const [loading, setLoading]     = useState(false);

  const curStep = step === 'phone' ? 1 : step === 'otp' ? 2 : 3;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.requestOtp(phone, 'register');
      toast.success('OTP sent!');
      setStep('otp');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.trim().length < 4) {
      toast.error('Enter the OTP you received.');
      return;
    }
    setStep('profile');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.register({
        phone,
        otpCode:  otp,
        fullName:  fullName || undefined,
        email:     email    || undefined,
        password:  password || undefined,
      });
      toast.success('Account created! Welcome to Ishtile.');
      router.push('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Step indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
        {stepLabel(1, curStep)} <span style={{ height: '1px', width: '2rem', backgroundColor: 'var(--border)' }} />
        {stepLabel(2, curStep)} <span style={{ height: '1px', width: '2rem', backgroundColor: 'var(--border)' }} />
        {stepLabel(3, curStep)}
      </div>

      {step === 'phone' && (
        <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Phone Number</label>
            <Input type="tel" placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} required autoFocus />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending…' : 'Send OTP'}
          </Button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-muted)', textAlign: 'center' }}>
            OTP sent to <strong>{phone}</strong>.
          </p>
          <div>
            <label style={labelStyle}>Enter OTP</label>
            <Input type="text" inputMode="numeric" placeholder="XXXXXX" value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={8} required autoFocus />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            Continue →
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => { setOtp(''); setStep('phone'); }}>
            ← Change number
          </Button>
        </form>
      )}

      {step === 'profile' && (
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Full Name <span style={{ fontWeight: 400, letterSpacing: 0 }}>(optional)</span></label>
            <Input placeholder="Your name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Email <span style={{ fontWeight: 400, letterSpacing: 0 }}>(optional)</span></label>
            <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Password <span style={{ fontWeight: 400, letterSpacing: 0 }}>(optional)</span></label>
            <div style={{ position: 'relative' }}>
              <Input
                type={showPwd ? 'text' : 'password'}
                placeholder="Set a password for future logins"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: '2.5rem' }}
              />
              <button type="button" onClick={() => setShowPwd((v) => !v)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-muted)' }} aria-label="Toggle password visibility">
                {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>
      )}
    </div>
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

        <div style={{ backgroundColor: 'var(--surface)', borderRadius: '1rem', padding: '2rem', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', border: '1px solid var(--border)' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
            Create Account
          </h1>
          <Suspense>
            <RegisterForm />
          </Suspense>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--on-surface-muted)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--brand-gold)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}
