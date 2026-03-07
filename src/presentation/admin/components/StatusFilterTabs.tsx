'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { OrderStatus } from '@/shared/types/api.types';

const TABS: { label: string; value: OrderStatus | 'all' }[] = [
  { label: 'All',       value: 'all' },
  { label: 'New',       value: 'new' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Shipped',   value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function StatusFilterTabs() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const current      = searchParams.get('status') ?? 'all';

  const setStatus = (v: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete('page');
    if (v === 'all') p.delete('status'); else p.set('status', v);
    router.push(`/admin/orders?${p.toString()}`);
  };

  return (
    <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
      {TABS.map(({ label, value }) => {
        const active = current === value;
        return (
          <button
            key={value}
            onClick={() => setStatus(value)}
            style={{
              padding:         '0.35rem 0.875rem',
              borderRadius:    '9999px',
              fontSize:        '0.75rem',
              fontWeight:      active ? 700 : 500,
              border:          active ? 'none' : '1px solid var(--border)',
              backgroundColor: active ? 'var(--primary)' : 'transparent',
              color:           active ? 'var(--on-primary)' : 'var(--on-surface)',
              cursor:          'pointer',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
