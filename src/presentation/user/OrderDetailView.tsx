'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import UserLayout from './UserLayout';
import OrderSummaryCard from '@/presentation/orders/components/OrderSummaryCard';
import { Button } from '@/components/ui/button';
import { getOrder } from '@/application/order/getOrder';
import type { Order } from '@/domain/order/order.entity';

export default function OrderDetailView() {
  const params                  = useParams<{ id: string }>();
  const [order, setOrder]       = useState<Order | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Note: params.id is a Convex ID string, but domain expects number type.
    const orderId = params.id as unknown as number;
    if (!orderId) { setNotFound(true); setLoading(false); return; }
    getOrder(orderId)
      .then((o) => { if (!o) { setNotFound(true); } else { setOrder(o); } })
      .catch(() => toast.error('Failed to load order.'))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <UserLayout activeHref="/orders">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', }}>
          <Button asChild variant="ghost" style={{padding: '0.5rem'}} >
            <Link href="/orders">← Orders</Link>
          </Button>
          {order && <h1 style={{ fontSize: '1.1rem', fontWeight: 700, }}>Order #{order.orderNumber}</h1>}

        </div>

        {loading && <Skeleton style={{ height: '12rem' }} />}
        {notFound && !loading && <p style={{ color: 'var(--on-surface-muted)' }}>Order not found.</p>}
        {order && <OrderSummaryCard order={order} />}
      </div>
    </UserLayout>
  );
}
