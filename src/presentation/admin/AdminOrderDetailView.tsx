'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import { AdminSidebarNav } from './AdminLayout';
import AdminMobileNavStrip from './components/AdminMobileNavStrip';
import OrderSummaryCard from '@/presentation/orders/components/OrderSummaryCard';
import OrderStatusSelector from './components/OrderStatusSelector';
import { Button } from '@/components/ui/button';
import { getAdminOrder } from '@/application/order/getAdminOrder';
import { generateMemo } from '@/application/order/generateMemo';
import type { Order } from '@/domain/order/order.entity';

const sectionStyle: React.CSSProperties = {
  border:          '1px solid var(--border)',
  padding:         '1.25rem',
  backgroundColor: 'var(--surface)',
};

const headingStyle: React.CSSProperties = {
  fontSize:      '0.7rem',
  fontWeight:    700,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color:         'var(--on-surface-muted)',
  marginBottom:  '1rem',
};

export default function AdminOrderDetailView() {
  const params                  = useParams<{ id: string }>();
  const [order, setOrder]         = useState<Order | null>(null);
  const [loading, setLoading]     = useState(true);
  const [notFound, setNotFound]   = useState(false);
  const [memoLoading, setMemoLoading] = useState(false);

  const handleGenerateMemo = async () => {
    if (!order) return;
    setMemoLoading(true);
    try {
      const filename = await generateMemo(order.id);
      toast.success(`Invoice downloaded: ${filename}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate memo.');
    } finally {
      setMemoLoading(false);
    }
  };

  useEffect(() => {
    // Note: params.id is a Convex ID string, but domain expects number type.
    const orderId = params.id as unknown as number;
    if (!orderId) { setNotFound(true); setLoading(false); return; }
    getAdminOrder(orderId)
      .then((o) => { if (!o) { setNotFound(true); } else { setOrder(o); } })
      .catch(() => toast.error('Failed to load order.'))
      .finally(() => setLoading(false));
  }, [params.id]);

  return (
    <ShopLayout>
      {/* Mobile-only nav */}
      <div className="lg:hidden" style={{ padding: '1.25rem 1rem 0' }}>
        <AdminMobileNavStrip activeHref="/admin/orders" />
      </div>

      <div style={{ maxWidth: '84rem', margin: '0 auto', padding: '1.25rem 1.25rem 2rem' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'start' }}>
          {/* Sidebar — desktop only */}
          <div className="hidden lg:block" style={{ width: '13rem', flexShrink: 0 }}>
            <AdminSidebarNav activeHref="/admin/orders" />
          </div>

          {/* Main content */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Button asChild variant="ghost" style={{ padding: '0.5rem' }}>
                <Link href="/admin/orders">← Orders</Link>
              </Button>
              {order && <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Order #{order.orderNumber}</h1>}
              {order && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:text-white"
                  style={{ marginLeft: 'auto', fontSize: '0.75rem', gap: '0.35rem', padding: '0.5rem' }}
                  onClick={handleGenerateMemo}
                  disabled={memoLoading}
                >
                  {memoLoading ? 'Generating…' : '↓ Download Memo'}
                </Button>
              )}
            </div>

            {loading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[1, 2].map((i) => <Skeleton key={i} style={{ height: '12rem' }} />)}
              </div>
            )}
            {notFound && !loading && <p style={{ color: 'var(--on-surface-muted)' }}>Order not found.</p>}
            {order && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <OrderSummaryCard order={order} />
                <div style={sectionStyle}>
                  <p style={headingStyle}>Update Status</p>
                  <OrderStatusSelector
                    orderId={order.id}
                    currentStatus={order.status}
                    onStatusChange={(s, adminNotes) => setOrder((o) => o ? { ...o, status: s, ...(adminNotes !== null ? { adminNotes } : {}) } : o)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}
