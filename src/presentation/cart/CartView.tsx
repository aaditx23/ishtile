'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import CartItemRow from './components/CartItemRow';
import CartSummary from './components/CartSummary';
import EmptyState from '@/presentation/shared/components/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { getCart } from '@/application/cart/getCart';
import { clearCart } from '@/application/cart/clearCart';
import type { Cart } from '@/domain/cart/cart.entity';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

function CartSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
          <Skeleton style={{ width: '80px', height: '107px', borderRadius: '0.5rem', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Skeleton style={{ height: '1rem', width: '60%' }} />
            <Skeleton style={{ height: '0.875rem', width: '30%' }} />
            <Skeleton style={{ height: '0.875rem', width: '20%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CartView() {
  const [cart, setCart]     = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      const data = await getCart();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const handleClearCart = async () => {
    if (!confirm('Remove all items from your cart?')) return;
    setClearing(true);
    try {
      await clearCart();
      toast.success('Cart cleared.');
      await fetchCart();
    } catch {
      toast.error('Could not clear cart.');
    } finally {
      setClearing(false);
    }
  };

  return (
    <ShopLayout>
      <div style={{ paddingTop: '80px', maxWidth: '1100px', margin: '0 auto', padding: '100px 3rem 4rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Your Cart
          </h1>
          {cart && cart.totalItems > 0 && (
            <Button variant="ghost" size="sm" disabled={clearing} onClick={handleClearCart} style={{ color: 'var(--on-surface-muted)', fontSize: '0.8rem' }}>
              {clearing ? 'Clearing…' : 'Clear cart'}
            </Button>
          )}
        </div>

        {loading && <CartSkeleton />}

        {!loading && (!cart || cart.totalItems === 0) && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', paddingTop: '4rem' }}>
            <EmptyState
              title="Your cart is empty"
              description="Looks like you haven't added anything yet."
            />
            <Button asChild size="lg" className="tracking-widest uppercase" style={{ padding: '0 2rem' }}>
              <Link href="/products">
                Browse Products
              </Link>
            </Button>
          </div>
        )}

        {!loading && cart && cart.totalItems > 0 && (
          <div
            style={{
              display:       'grid',
              gridTemplateColumns: '1fr min(320px, 100%)',
              gap:           '2rem',
              alignItems:    'flex-start',
            }}
          >
            {/* Item list */}
            <div>
              {cart.items.map((item) => (
                <CartItemRow key={item.id} item={item} onUpdate={fetchCart} />
              ))}
            </div>

            {/* Summary */}
            <CartSummary cart={cart} />
          </div>
        )}
      </div>
    </ShopLayout>
  );
}
