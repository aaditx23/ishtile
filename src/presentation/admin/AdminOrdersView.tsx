import Link from 'next/link';
import { Suspense } from 'react';
import AdminLayout from './AdminLayout';
import StatusFilterTabs from './components/StatusFilterTabs';
import Pagination from '@/presentation/shared/components/Pagination';
import OrderStatusBadge from '@/presentation/orders/components/OrderStatusBadge';
import type { Order } from '@/domain/order/order.entity';
import type { Pagination as PaginationMeta } from '@/shared/types/api.types';

interface AdminOrdersViewProps {
  orders:     Order[];
  pagination: PaginationMeta;
}

const fmt = (n: number) => `৳${n.toFixed(0)}`;

export default function AdminOrdersView({ orders, pagination }: AdminOrdersViewProps) {
  return (
    <AdminLayout activeHref="/admin/orders">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Orders</h1>
        </div>

        <Suspense><StatusFilterTabs /></Suspense>

        {/* Table */}
        <div
          style={{
            border:          '1px solid var(--border)',
            borderRadius:    '0.75rem',
            overflow:        'hidden',
            backgroundColor: 'var(--surface)',
          }}
        >
          {orders.length === 0 ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--on-surface-muted)', fontSize: '0.875rem' }}>
              No orders found.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-muted)' }}>
                  {['Order #', 'Date', 'Customer', 'Total', 'Status', ''].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding:   '0.6rem 1rem',
                        textAlign: 'left',
                        fontWeight: 600,
                        fontSize:  '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color:     'var(--on-surface-muted)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, i) => (
                  <tr
                    key={order.id}
                    style={{
                      borderBottom: i < orders.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {order.orderNumber}
                    </td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--on-surface-muted)', whiteSpace: 'nowrap' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <p style={{ fontWeight: 600 }}>{order.shippingName}</p>
                      <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.7rem' }}>{order.shippingPhone}</p>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>{fmt(order.total)}</td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <OrderStatusBadge status={order.status} size="sm" />
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        style={{
                          fontSize:       '0.75rem',
                          fontWeight:     600,
                          textDecoration: 'none',
                          color:          'var(--brand-gold)',
                        }}
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {pagination.totalPages > 1 && (
          <Suspense><Pagination pagination={pagination} /></Suspense>
        )}
      </div>
    </AdminLayout>
  );
}
