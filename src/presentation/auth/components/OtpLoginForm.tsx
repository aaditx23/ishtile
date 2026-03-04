'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { authService } from '@/infrastructure/auth/auth.service';

type Step = 'phone' | 'otp';

/** OTP-based login: phone → receive OTP → verify → logged in */
export default function OtpLoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const next         = searchParams.get('next') ?? '/';

  const [step, setStep]     = useState<Step>('phone');
  const [phone, setPhone]   = useState('');
  const [otp, setOtp]       = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.requestOtp(phone, 'login');
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
    setLoading(true);
    try {
      await authService.verifyOtp(phone, otp);
      toast.success('Logged in!');
      router.push(next);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'phone') {
    return (
      <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Phone Number</label>
          <Input
            type="tel"
            placeholder="01XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            autoFocus
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Sending…' : 'Send OTP'}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-muted)' }}>
        OTP sent to <strong>{phone}</strong>.{' '}
        <button type="button" onClick={() => setStep('phone')} style={{ color: 'var(--brand-gold)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>
          Change number
        </button>
      </p>
      <div>
        <label style={labelStyle}>Enter OTP</label>
        <Input
          type="text"
          inputMode="numeric"
          placeholder="XXXXXX"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={8}
          required
          autoFocus
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Verifying…' : 'Verify & Login'}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={loading}
        onClick={() => { setOtp(''); setStep('phone'); }}
      >
        ← Back / Resend OTP
      </Button>
    </form>
  );
}

const labelStyle: React.CSSProperties = {
  display:       'block',
  fontSize:      '0.75rem',
  fontWeight:    600,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color:         'var(--on-surface-muted)',
  marginBottom:  '0.4rem',
};
