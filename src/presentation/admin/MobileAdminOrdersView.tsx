'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import AdminMobileNavStrip from './components/AdminMobileNavStrip';
import StatusFilterTabs from './components/StatusFilterTabs';
import Pagination from '@/presentation/shared/components/Pagination';
import OrderStatusBadge from '@/presentation/orders/components/OrderStatusBadge';
import type { Order } from '@/domain/order/order.entity';
import type { Pagination as PaginationMeta } from '@/shared/types/api.types';

const fmt = (n: number) => `৳${Number(n || 0).toFixed(0)}`;

interface MobileAdminOrdersViewProps {
  orders:     Order[];
  loading:    boolean;
  pagination: PaginationMeta | null;
}

export default function MobileAdminOrdersView({ orders, loading, pagination }: MobileAdminOrdersViewProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1.25rem 1rem' }}>
        <AdminMobileNavStrip activeHref="/admin/orders" />
      </div>

      <div style={{ padding: '0 1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Orders</h1>

        {/* Status filter tabs */}
        <Suspense><StatusFilterTabs /></Suspense>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} style={{ height: '5.5rem' }} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--on-surface-muted)', fontSize: '0.875rem', marginTop: '2rem' }}>
            No orders found.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div
                  style={{
                    border:          '1px solid var(--border)',
                    padding:         '0.875rem 1rem',
                    backgroundColor: 'var(--surface)',
                    display:         'flex',
                    flexDirection:   'column',
                    gap:             '0.375rem',
                  }}
                >
                  {/* Row 1: order number + status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.85rem' }}>
                      #{order.orderNumber}
                    </span>
                    <OrderStatusBadge status={order.status} size="sm" />
                  </div>
                  {/* Row 2: customer + total */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{order.shippingName}</span>
                      <span style={{ color: 'var(--on-surface-muted)', marginLeft: '0.375rem', fontSize: '0.75rem' }}>
                        {order.shippingPhone}
                      </span>
                    </div>
                    <span style={{ fontWeight: 700 }}>{fmt(order.total)}</span>
                  </div>
                  {/* Row 3: date */}
                  <p style={{ fontSize: '0.72rem', color: 'var(--on-surface-muted)' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <Suspense><Pagination pagination={pagination} /></Suspense>
        )}
      </div>
    </div>
  );
}
