'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { updateOrderStatus } from '@/application/order/updateOrderStatus';
import type { OrderStatus } from '@/shared/types/api.types';

const STATUSES: OrderStatus[] = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'];

interface OrderStatusSelectorProps {
  orderId:         number;
  currentStatus:   OrderStatus;
  onStatusChange?: (newStatus: OrderStatus, adminNotes: string | null) => void;
  disabled?:       boolean;
  disabledMessage?: string;
}

export default function OrderStatusSelector({
  orderId,
  currentStatus,
  onStatusChange,
  disabled = false,
  disabledMessage,
}: OrderStatusSelectorProps) {
  const [status, setStatus]     = useState<OrderStatus>(currentStatus);
  const [savedStatus, setSaved] = useState<OrderStatus>(currentStatus);
  const [notes, setNotes]       = useState('');
  const [saving, setSaving]     = useState(false);
  const isDirty                 = status !== savedStatus;

  const handleSave = async () => {
    if (!isDirty || disabled) return;
    setSaving(true);
    const trimmedNotes = notes.trim();
    try {
      const updated = await updateOrderStatus(orderId, { status, adminNotes: trimmedNotes || undefined });
      setSaved(updated.status);
      setNotes('');
      toast.success(`Order status updated to ${updated.status}`);
      onStatusChange?.(updated.status, trimmedNotes || null);
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {disabled && (
        <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-muted)' }}>
          {disabledMessage ?? 'Order status is managed automatically by Pathao.'}
        </p>
      )}

      {/* Status pills */}
      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
        {STATUSES.map((s) => {
          const active = status === s;
          return (
            <button
              key={s}
              onClick={() => setStatus(s)}
              disabled={saving || disabled}
              style={{
                padding:         '0.35rem 0.875rem',
                fontSize:        '0.75rem',
                fontWeight:      active ? 700 : 500,
                border:          active ? '2px solid var(--brand-gold)' : '1px solid var(--border)',
                backgroundColor: active ? 'var(--brand-gold)' : 'transparent',
                color:           active ? '#fff' : 'var(--on-surface)',
                cursor:          (saving || disabled) ? 'not-allowed' : 'pointer',
                opacity:         (saving || disabled) ? 0.6 : 1,
                textTransform:   'capitalize',
              }}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* Admin notes */}
      <textarea
        placeholder="Admin note (optional)…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        disabled={saving || disabled}
        rows={2}
        style={{
          width:        '100%',
          padding:      '0.5rem 0.75rem',
          border:       '1px solid var(--border)',
          fontSize:     '0.8rem',
          resize:       'vertical',
          backgroundColor: 'var(--surface)',
          color:        'inherit',
          fontFamily:   'inherit',
        }}
      />

      <Button
        onClick={handleSave}
        disabled={!isDirty || saving || disabled}
        style={{ alignSelf: 'flex-start', minWidth: '9rem' }}
      >
        {saving ? 'Saving…' : 'Save Status'}
      </Button>
    </div>
  );
}
