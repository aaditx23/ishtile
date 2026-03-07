'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { Cart } from '@/domain/cart/cart.entity';

const fmt = (n: number) => `৳${Number(n || 0).toFixed(0)}`;

export default function MobileCartBar({ cart }: { cart: Cart }) {
  return (
    <div
      className="lg:hidden"
      style={{
        position:        'fixed',
        bottom:          0,
        left:            0,
        right:           0,
        zIndex:          50,
        backgroundColor: 'var(--surface)',
        borderTop:       '1px solid var(--border)',
        boxShadow:       '0 -4px 20px rgba(0,0,0,0.14)',
        padding:         '0.875rem 1.25rem',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'space-between',
        gap:             '1rem',
      }}
    >
      <div>
        <p style={{ fontSize: '0.65rem', color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.15rem' }}>
          {cart.totalItems} item{cart.totalItems !== 1 ? 's' : ''}
        </p>
        <p style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--brand-gold)', lineHeight: 1 }}>
          {fmt(cart.subtotal)}
        </p>
      </div>
      <Button asChild size="lg" className="tracking-[0.08em] uppercase shrink-0" style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
        <Link href="/checkout">Checkout →</Link>
      </Button>
    </div>
  );
}
