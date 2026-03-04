'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import UserLayout from './UserLayout';
import Pagination from '@/presentation/shared/components/Pagination';
import OrderStatusBadge from '@/presentation/orders/components/OrderStatusBadge';
import { getOrders } from '@/application/order/getOrders';
import type { Order } from '@/domain/order/order.entity';
import type { Pagination as PaginationMeta } from '@/shared/types/api.types';

const fmt = (n: number) => `৳${n.toFixed(0)}`;

export default function OrderHistoryView() {
  const searchParams                = useSearchParams();
  const page                        = Math.max(1, Number(searchParams.get('page')) || 1);
  const [orders, setOrders]         = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    setLoading(true);
    getOrders({ page, pageSize: 10 })
      .then(({ items, pagination: pg }) => { setOrders(items); setPagination(pg); })
      .catch(() => toast.error('Failed to load orders.'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <UserLayout activeHref="/orders">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>My Orders</h1>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1,2,3].map((i) => <Skeleton key={i} style={{ height: '4rem', borderRadius: '0.75rem' }} />)}
          </div>
        ) : orders.length === 0 ? (
          <div
            style={{
              padding:         '3rem',
              textAlign:       'center',
              border:          '1px dashed var(--border)',
              borderRadius:    '0.75rem',
              color:           'var(--on-surface-muted)',
              fontSize:        '0.9rem',
            }}
          >
            You haven&apos;t placed any orders yet.
          </div>
        ) : (
          orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              style={{
                display:         'block',
                textDecoration:  'none',
                border:          '1px solid var(--border)',
                borderRadius:    '0.75rem',
                padding:         '1rem 1.25rem',
                backgroundColor: 'var(--surface)',
                transition:      'border-color 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>#{order.orderNumber}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)', marginTop: '0.15rem' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <OrderStatusBadge status={order.status} size="sm" />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{fmt(order.total)}</span>
                </div>
              </div>
            </Link>
          ))
        )}

        {pagination && pagination.totalPages > 1 && (
          <Suspense>
            <Pagination pagination={pagination} />
          </Suspense>
        )}
      </div>
    </UserLayout>
  );
}
