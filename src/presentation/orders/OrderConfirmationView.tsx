import Link from 'next/link';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import OrderSummaryCard from './components/OrderSummaryCard';
import { Button } from '@/components/ui/button';
import type { Order } from '@/domain/order/order.entity';

interface OrderConfirmationViewProps {
  order: Order;
}

export default function OrderConfirmationView({ order }: OrderConfirmationViewProps) {
  return (
    <ShopLayout>
      <div style={{ maxWidth: '40rem', margin: '0 auto', padding: '2.5rem 1.25rem' }}>

        {/* Success banner */}
        <div
          style={{
            textAlign:       'center',
            padding:         '2rem 1.5rem',
            marginBottom:    '2rem',
            borderRadius:    '0.75rem',
            backgroundColor: 'var(--surface)',
            border:          '1px solid var(--border)',
          }}
        >
          <div
            style={{
              width:           '3.5rem',
              height:          '3.5rem',
              borderRadius:    '50%',
              backgroundColor: 'var(--brand-gold)',
              display:         'flex',
              alignItems:      'center',
              justifyContent:  'center',
              margin:          '0 auto 1rem',
              fontSize:        '1.5rem',
            }}
          >
            ✓
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Order Placed!
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--on-surface-muted)' }}>
            Thank you for shopping with Ishtyle. We&apos;ll confirm your order shortly.
          </p>
        </div>

        {/* Order details */}
        <OrderSummaryCard order={order} />

        {/* Actions */}
        <div
          style={{
            display:   'flex',
            gap:       '0.75rem',
            marginTop: '2rem',
            flexWrap:  'wrap',
          }}
        >
          <Button asChild style={{ backgroundColor: 'var(--brand-dark)', color: 'var(--on-primary)', flex: 1 }}>
            <Link href="/buyer/orders">View My Orders</Link>
          </Button>
          <Button asChild variant="outline" style={{ flex: 1 }}>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </ShopLayout>
  );
}
