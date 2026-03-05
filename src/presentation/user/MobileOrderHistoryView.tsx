'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import UserMobileNavStrip from './components/UserMobileNavStrip';
import { Skeleton } from '@/components/ui/skeleton';
import Pagination from '@/presentation/shared/components/Pagination';
import OrderStatusBadge from '@/presentation/orders/components/OrderStatusBadge';
import type { Order } from '@/domain/order/order.entity';
import type { Pagination as PaginationMeta } from '@/shared/types/api.types';

interface MobileOrderHistoryViewProps {
  orders:     Order[];
  loading:    boolean;
  pagination: PaginationMeta | null;
}

const fmt = (n: number) => `৳${Number(n || 0).toFixed(0)}`;

export default function MobileOrderHistoryView({
  orders,
  loading,
  pagination,
}: MobileOrderHistoryViewProps) {
  return (
    <div style={{ padding: '1.25rem 1rem' }}>

      {/* Page title */}
      <h1 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
        My Orders
      </h1>

      <UserMobileNavStrip activeHref="/orders" />

      {/* Orders list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {loading ? (
          [1, 2, 3].map((i) => (
            <Skeleton key={i} style={{ height: '4rem', borderRadius: '0.75rem' }} />
          ))
        ) : orders.length === 0 ? (
          <div
            style={{
              padding:      '3rem',
              textAlign:    'center',
              border:       '1px dashed var(--border)',
              borderRadius: '0.75rem',
              color:        'var(--on-surface-muted)',
              fontSize:     '0.9rem',
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
                transition:      'all 0.2s ease',
              }}
              className="hover:bg-[var(--surface-variant)] active:scale-[0.99]"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>#{order.orderNumber}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)', marginTop: '0.15rem' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
    </div>
  );
}
