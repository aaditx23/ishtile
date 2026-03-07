'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { validatePromo } from '@/application/promo/validatePromo';
import type { PromoValidationDto } from '@/shared/types/api.types';

interface PromoInputProps {
  subtotal:     number;
  onApply:      (result: PromoValidationDto, code: string) => void;
  onRemove:     () => void;
  appliedCode?: string;
  discount?:    number;
}

export default function PromoInput({ subtotal, onApply, onRemove, appliedCode, discount }: PromoInputProps) {
  const [code, setCode]     = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    try {
      const result = await validatePromo(code.trim(), subtotal);
      if (result.isValid) {
        onApply(result, code.trim());
        setCode('');
      } else {
        setError(result.message || 'Invalid promo code.');
      }
    } catch {
      setError('Could not validate promo code.');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) => `৳${Number(n || 0).toFixed(0)}`;

  // Applied state
  if (appliedCode) {
    return (
      <div
        style={{
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'space-between',
          padding:         '0.75rem 1rem',
          borderRadius:    '0.5rem',
          border:          '1px solid var(--brand-gold)',
          backgroundColor: 'rgba(165,140,105,0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiCheckCircle size={16} style={{ color: 'var(--brand-gold)' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
            {appliedCode}
          </span>
          {discount !== undefined && (
            <span style={{ fontSize: '0.8rem', color: 'var(--brand-gold)' }}>
              − {fmt(discount)}
            </span>
          )}
        </div>
        <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-muted)' }} aria-label="Remove promo code">
          <FiXCircle size={16} />
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Input
          placeholder="Promo code"
          value={code}
          onChange={(e) => { setCode(e.target.value); setError(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleApply(); } }}
          style={{ flex: 1 }}
          disabled={loading}
        />
        <Button variant="outline" onClick={handleApply} disabled={loading || !code.trim()}>
          {loading ? '…' : 'Apply'}
        </Button>
      </div>
      {error && (
        <p style={{ fontSize: '0.8rem', color: 'var(--destructive)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <FiXCircle size={14} /> {error}
        </p>
      )}
    </div>
  );
}
