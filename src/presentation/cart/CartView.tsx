'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import CartItemRow from './components/CartItemRow';
import CartSummary from './components/CartSummary';
import MobileCartView from './MobileCartView';
import EmptyState from '@/presentation/shared/components/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import { getCart } from '@/application/cart/getCart';
import { clearCart } from '@/application/cart/clearCart';
import type { Cart } from '@/domain/cart/cart.entity';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

function DesktopSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ display: 'flex', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
          <Skeleton style={{ width: '88px', height: '117px', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.25rem' }}>
            <Skeleton style={{ height: '0.9rem', width: '60%' }} />
            <Skeleton style={{ height: '0.8rem', width: '30%' }} />
            <Skeleton style={{ height: '0.8rem', width: '20%' }} />
            <Skeleton style={{ height: '1rem', width: '25%', marginTop: '0.5rem' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CartView() {
  const [cart, setCart]         = useState<Cart | null>(null);
  const [loading, setLoading]   = useState(true);
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

  return (
    <ShopLayout>
      {/* ── Mobile ──────────────────────────────────────────────── */}
      <div className="block lg:hidden">
        <MobileCartView
          cart={cart}
          loading={loading}
          clearing={clearing}
          onUpdate={fetchCart}
        />
      </div>

      {/* ── Desktop ─────────────────────────────────────────────── */}
      <div className="hidden lg:block">
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2.5rem 3rem 4rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Your Cart
            </h1>
          </div>

          {loading && <DesktopSkeleton />}

          {!loading && (!cart || cart.totalItems === 0) && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', paddingTop: '4rem' }}>
              <EmptyState title="Your cart is empty" description="Looks like you haven't added anything yet." />
              <Button asChild size="lg" className="tracking-widest uppercase" style={{ padding: '0 2rem' }}>
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          )}

          {!loading && cart && cart.totalItems > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'flex-start' }}>
              <div>
                {cart.items.map((item) => (
                  <CartItemRow key={item.id} item={item} onUpdate={fetchCart} />
                ))}
              </div>
              <CartSummary cart={cart} />
            </div>
          )}
        </div>
      </div>
    </ShopLayout>
  );
}
