'use client';

import { useRouter, useSearchParams } from 'next/navigation';

const TABS: { label: string; value: 'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' }[] = [
  { label: 'All',       value: 'all' },
  { label: 'Pending',   value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Shipped',   value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function StatusFilterTabs() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const currentRaw   = searchParams.get('status') ?? 'all';
  const current      = currentRaw === 'new' ? 'pending' : currentRaw;

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
