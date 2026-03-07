import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Cart } from '@/domain/cart/cart.entity';

interface CartSummaryProps {
  cart: Cart;
}

const fmt = (n: number) => `৳${Number(n || 0).toFixed(0)}`;

/**
 * Order summary sidebar — shows subtotal, item count, and checkout CTA.
 * Static; no interactivity needed here.
 */
export default function CartSummary({ cart }: CartSummaryProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        borderRadius:    '0.75rem',
        border:          '1px solid var(--border)',
        padding:         '1.5rem',
        display:         'flex',
        flexDirection:   'column',
        gap:             '1rem',
        position:        'sticky',
        top:             '90px',
      }}
    >
      <h2 style={{ fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
        Order Summary
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--on-surface-muted)' }}>Items ({cart.totalItems})</span>
          <span>{fmt(cart.subtotal)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--on-surface-muted)' }}>Shipping</span>
          <span style={{ color: 'var(--on-surface-muted)' }}>Calculated at checkout</span>
        </div>
      </div>

      <Separator />

      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem' }}>
        <span>Subtotal</span>
        <span style={{ color: 'var(--brand-gold)' }}>{fmt(cart.subtotal)}</span>
      </div>

      <Button
        asChild
        size="lg"
        className="w-full tracking-[0.08em] uppercase"
      >
        <Link href="/checkout">Proceed to Checkout →</Link>
      </Button>

      <Button asChild variant="ghost" size="sm" className="w-full">
        <Link href="/products">← Continue Shopping</Link>
      </Button>
    </div>
  );
}
