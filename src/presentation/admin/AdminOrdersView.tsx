'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import { AdminSidebarNav } from './AdminLayout';
import MobileAdminOrdersView from './MobileAdminOrdersView';
import StatusFilterTabs from './components/StatusFilterTabs';
import Pagination from '@/presentation/shared/components/Pagination';
import OrderStatusBadge from '@/presentation/orders/components/OrderStatusBadge';
import { getAdminOrders } from '@/application/order/getAdminOrders';
import { generateMemo } from '@/application/order/generateMemo';
import { confirmOrderWithDelivery } from '@/application/order/confirmOrderWithDelivery';
import type { Order } from '@/domain/order/order.entity';
import type { Pagination as PaginationMeta, OrderStatus } from '@/shared/types/api.types';

const fmt = (n: number) => `৳${Number(n || 0).toFixed(0)}`;

// ─── Batch download progress modal ───────────────────────────────────────────

type DownloadStatus = 'pending' | 'downloading' | 'done' | 'error';

interface DownloadItem {
  id: number;
  orderNumber: string;
  status: DownloadStatus;
  error?: string;
}

function BatchProgressModal({
  items,
  onClose,
}: {
  items: DownloadItem[];
  onClose: () => void;
}) {
  const done  = items.filter((i) => i.status === 'done').length;
  const total = items.length;
  const allSettled = items.every((i) => i.status === 'done' || i.status === 'error');

  return (
    <div
      style={{
        position:        'fixed',
        inset:           0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        zIndex:          9999,
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius:    '0.875rem',
          padding:         '1.75rem',
          width:           '100%',
          maxWidth:        '28rem',
          boxShadow:       '0 8px 32px rgba(0,0,0,0.18)',
          display:         'flex',
          flexDirection:   'column',
          gap:             '1rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
            Downloading Memos
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-muted)' }}>
            {done} / {total}
          </span>
        </div>

        {/* progress bar */}
        <div style={{ height: 4, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
          <div
            style={{
              height:     '100%',
              borderRadius: 4,
              width:      `${(done / total) * 100}%`,
              background: 'var(--brand-gold, #b8860b)',
              transition: 'width 0.3s',
            }}
          />
        </div>

        {/* item list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '16rem', overflowY: 'auto' }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                display:        'flex',
                alignItems:     'center',
                gap:            '0.6rem',
                padding:        '0.35rem 0.6rem',
                borderRadius:   '0.4rem',
                background:     item.status === 'downloading' ? 'var(--surface-muted, #f4f4f4)' : 'transparent',
                fontSize:       '0.82rem',
              }}
            >
              {/* icon */}
              <span style={{ width: 18, textAlign: 'center', flexShrink: 0 }}>
                {item.status === 'pending'     && <span style={{ color: '#aaa' }}>○</span>}
                {item.status === 'downloading' && (
                  <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
                )}
                {item.status === 'done'  && <span style={{ color: '#22c55e' }}>✓</span>}
                {item.status === 'error' && <span style={{ color: '#ef4444' }}>✕</span>}
              </span>
              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{item.orderNumber}</span>
              {item.status === 'error' && (
                <span style={{ fontSize: '0.72rem', color: '#ef4444', marginLeft: 'auto' }}>
                  {item.error ?? 'Failed'}
                </span>
              )}
            </div>
          ))}
        </div>

        {allSettled && (
          <button
            onClick={onClose}
            style={{
              alignSelf:    'flex-end',
              padding:      '0.5rem 1.25rem',
              background:   'var(--brand-dark, #000)',
              color:        '#fff',
              border:       'none',
              borderRadius: '0.5rem',
              fontWeight:   600,
              fontSize:     '0.82rem',
              cursor:       'pointer',
            }}
          >
            Close
          </button>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Batch Pathao delivery modal ──────────────────────────────────────────────

type PathaoItemStatus = 'pending' | 'processing' | 'done' | 'error' | 'skipped';

interface PathaoItem {
  id:          number;
  orderNumber: string;
  status:      PathaoItemStatus;
  error?:      string;
  consignmentId?: string;
}

function BatchPathaoModal({
  orders,
  itemWeight,
  onClose,
}: {
  orders:     Order[];
  itemWeight: number;
  onClose:    () => void;
}) {
  const [items, setItems]     = useState<PathaoItem[]>(() =>
    orders.map((o) => ({ id: o.id, orderNumber: o.orderNumber, status: 'pending' })),
  );
  const [started, setStarted] = useState(false);
  const [done, setDone]       = useState(false);

  const allSettled = items.every((i) => ['done', 'error', 'skipped'].includes(i.status));

  const runBatch = async (currentItems: PathaoItem[], currentOrders: Order[]) => {
    setStarted(true);
    for (let i = 0; i < currentItems.length; i++) {
      setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, status: 'processing' } : it));
      const order = currentOrders[i];
      if (order.status !== 'new') {
        setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, status: 'skipped', error: `Status: ${order.status}` } : it));
        continue;
      }
      try {
        const result = await confirmOrderWithDelivery(order.id, {
          deliveryMode: 'pathao',
          itemWeight,
          itemQuantity: order.items?.reduce((s, item) => s + item.quantity, 0),
          deliveryType: 'Normal Delivery',
          amountToCollect: order.total,
        });
        setItems((prev) => prev.map((it, idx) =>
          idx === i ? { ...it, status: 'done', consignmentId: result.consignmentId } : it,
        ));
      } catch (err) {
        setItems((prev) => prev.map((it, idx) =>
          idx === i
            ? { ...it, status: 'error', error: err instanceof Error ? err.message : 'Failed' }
            : it,
        ));
      }
    }
    setDone(true);
  };

  const iconFor = (s: PathaoItemStatus) => {
    if (s === 'pending')    return <span style={{ color: '#aaa' }}>○</span>;
    if (s === 'processing') return <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>;
    if (s === 'done')       return <span style={{ color: '#22c55e' }}>✓</span>;
    if (s === 'error')      return <span style={{ color: '#ef4444' }}>✕</span>;
    if (s === 'skipped')    return <span style={{ color: '#f59e0b' }}>–</span>;
    return null;
  };

  const doneCount = items.filter((i) => i.status === 'done').length;

  return (
    <div
      style={{
        position:        'fixed',
        inset:           0,
        backgroundColor: 'rgba(0,0,0,0.45)',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        zIndex:          9999,
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius:    '0.875rem',
          padding:         '1.75rem',
          width:           '100%',
          maxWidth:        '32rem',
          boxShadow:       '0 8px 32px rgba(0,0,0,0.18)',
          display:         'flex',
          flexDirection:   'column',
          gap:             '1rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
            📦 Create Pathao Deliveries
          </h2>
          {started && (
            <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-muted)' }}>
              {doneCount} / {items.length} booked
            </span>
          )}
        </div>

        {!started && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-muted)', margin: 0 }}>
              All {orders.length} selected orders will be sent to Pathao using Normal Delivery with weight {itemWeight} kg each.
              Orders that are not in &ldquo;new&rdquo; status will be skipped.
            </p>
          </div>
        )}

        {started && (
          <>
            <div style={{ height: 4, borderRadius: 4, background: 'var(--border)', overflow: 'hidden' }}>
              <div
                style={{
                  height:    '100%',
                  borderRadius: 4,
                  width:     `${(doneCount / items.length) * 100}%`,
                  background: 'var(--brand-gold, #b8860b)',
                  transition: 'width 0.3s',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '16rem', overflowY: 'auto' }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display:      'flex',
                    alignItems:   'center',
                    gap:          '0.6rem',
                    padding:      '0.35rem 0.6rem',
                    borderRadius: '0.4rem',
                    background:   item.status === 'processing' ? 'var(--surface-muted, #f4f4f4)' : 'transparent',
                    fontSize:     '0.82rem',
                  }}
                >
                  <span style={{ width: 18, textAlign: 'center', flexShrink: 0 }}>
                    {iconFor(item.status)}
                  </span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>#{item.orderNumber}</span>
                  {item.consignmentId && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-muted)', marginLeft: 'auto' }}>
                      {item.consignmentId}
                    </span>
                  )}
                  {(item.status === 'error' || item.status === 'skipped') && (
                    <span style={{ fontSize: '0.72rem', color: item.status === 'error' ? '#ef4444' : '#f59e0b', marginLeft: 'auto' }}>
                      {item.error}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          {!started && (
            <>
              <button
                onClick={onClose}
                style={{
                  padding:      '0.5rem 1rem',
                  background:   'transparent',
                  border:       '1px solid var(--border)',
                  borderRadius: '0.5rem',
                  fontWeight:   600,
                  fontSize:     '0.82rem',
                  cursor:       'pointer',
                  color:        'var(--on-surface)',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => runBatch(items, orders)}
                style={{
                  padding:      '0.5rem 1.25rem',
                  background:   'var(--brand-dark, #000)',
                  color:        '#fff',
                  border:       'none',
                  borderRadius: '0.5rem',
                  fontWeight:   600,
                  fontSize:     '0.82rem',
                  cursor:       'pointer',
                }}
              >
                Start ({orders.length})
              </button>
            </>
          )}
          {(allSettled || done) && (
            <button
              onClick={onClose}
              style={{
                padding:      '0.5rem 1.25rem',
                background:   'var(--brand-dark, #000)',
                color:        '#fff',
                border:       'none',
                borderRadius: '0.5rem',
                fontWeight:   600,
                fontSize:     '0.82rem',
                cursor:       'pointer',
              }}
            >
              Close
            </button>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function AdminOrdersView() {
  const searchParams                = useSearchParams();
  const page                        = Math.max(1, Number(searchParams.get('page')) || 1);
  const status                      = searchParams.get('status') as OrderStatus | null;
  const [orders, setOrders]         = useState<Order[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading]       = useState(true);

  // ── selection state ─────────────────────────────────────────────────────────
  const [selected, setSelected]             = useState<Set<number>>(new Set());
  const [downloadItems, setDownloadItems]   = useState<DownloadItem[] | null>(null);
  const [batchPathaoOrders, setBatchPathao] = useState<Order[] | null>(null);
  const BATCH_ITEM_WEIGHT                   = 0.5; // kg default for batch

  useEffect(() => {
    setLoading(true);
    setSelected(new Set());
    getAdminOrders({ page, pageSize: 20, status: status ?? undefined })
      .then(({ items, pagination: pg }) => { setOrders(items); setPagination(pg); })
      .catch(() => toast.error('Failed to load orders.'))
      .finally(() => setLoading(false));
  }, [page, status]);

  const allSelected = orders.length > 0 && orders.every((o) => selected.has(o.id));

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(orders.map((o) => o.id)));
    }
  }

  function toggleOne(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleBatchDownload() {
    if (selected.size === 0) return;

    const toDownload = orders.filter((o) => selected.has(o.id));
    const items: DownloadItem[] = toDownload.map((o) => ({
      id:          o.id,
      orderNumber: o.orderNumber,
      status:      'pending',
    }));
    setDownloadItems([...items]);

    for (let i = 0; i < items.length; i++) {
      // mark as downloading
      setDownloadItems((prev) =>
        prev!.map((it, idx) => idx === i ? { ...it, status: 'downloading' } : it),
      );
      try {
        await generateMemo(items[i].id);
        setDownloadItems((prev) =>
          prev!.map((it, idx) => idx === i ? { ...it, status: 'done' } : it),
        );
      } catch (err) {
        setDownloadItems((prev) =>
          prev!.map((it, idx) =>
            idx === i
              ? { ...it, status: 'error', error: err instanceof Error ? err.message : 'Failed' }
              : it,
          ),
        );
      }
    }
  }

  return (
    <ShopLayout>
      {/* ── Mobile ─────────────────────────────────────────────────────── */}
      <div className="block lg:hidden">
        <MobileAdminOrdersView
          orders={orders}
          loading={loading}
          pagination={pagination}
        />
      </div>

      {/* ── Desktop ────────────────────────────────────────────────────── */}
      <div
        className="hidden lg:grid"
        style={{
          maxWidth:            '84rem',
          margin:              '0 auto',
          padding:             '2rem 1.25rem',
          gridTemplateColumns: '13rem 1fr',
          gap:                 '2rem',
          alignItems:          'start',
        }}
      >
        <AdminSidebarNav activeHref="/admin/orders" />

        <main>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Orders</h1>

              {selected.size > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleBatchDownload}
                    style={{
                      padding:      '0.45rem 1rem',
                      background:   'var(--brand-dark, #000)',
                      color:        '#fff',
                      border:       'none',
                      borderRadius: '0.5rem',
                      fontWeight:   600,
                      fontSize:     '0.8rem',
                      cursor:       'pointer',
                      display:      'flex',
                      alignItems:   'center',
                      gap:          '0.4rem',
                    }}
                  >
                    ↓ Download Memos ({selected.size})
                  </button>
                  <button
                    onClick={() => {
                      const toConfirm = orders.filter((o) => selected.has(o.id));
                      setBatchPathao(toConfirm);
                    }}
                    style={{
                      padding:      '0.45rem 1rem',
                      background:   '#1d4ed8',
                      color:        '#fff',
                      border:       'none',
                      borderRadius: '0.5rem',
                      fontWeight:   600,
                      fontSize:     '0.8rem',
                      cursor:       'pointer',
                      display:      'flex',
                      alignItems:   'center',
                      gap:          '0.4rem',
                    }}
                  >
                    📦 Pathao Delivery ({selected.size})
                  </button>
                </div>
              )}
            </div>

            <Suspense><StatusFilterTabs /></Suspense>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[1,2,3,4,5].map((i) => <Skeleton key={i} style={{ height: '3.25rem', borderRadius: '0.5rem' }} />)}
              </div>
            ) : (
              <div
                style={{
                  border:          '1px solid var(--border)',
                  borderRadius:    '0.75rem',
                  overflowX:       'auto',
                  backgroundColor: 'var(--surface)',
                }}
              >
                {orders.length === 0 ? (
                  <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--on-surface-muted)', fontSize: '0.875rem' }}>
                    No orders found.
                  </p>
                ) : (
                  <table style={{ width: '100%', minWidth: '40rem', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-muted)' }}>
                        {/* Select-all checkbox */}
                        <th style={{ padding: '0.6rem 0.75rem 0.6rem 1rem', width: 36 }}>
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={toggleAll}
                            style={{ cursor: 'pointer', width: 15, height: 15 }}
                            title="Select all"
                          />
                        </th>
                        {['Order #', 'Date', 'Customer', 'Total', 'Status', ''].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding:       '0.6rem 1rem',
                              textAlign:     'left',
                              fontWeight:    600,
                              fontSize:      '0.7rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                              color:         'var(--on-surface-muted)',
                              whiteSpace:    'nowrap',
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
                          className="hover:bg-[var(--surface-variant)] transition-colors"
                          style={{
                            borderBottom:    i < orders.length - 1 ? '1px solid var(--border)' : 'none',
                            background:      selected.has(order.id) ? 'var(--surface-muted, #fafafa)' : undefined,
                          }}
                        >
                          <td style={{ padding: '0.75rem 0.75rem 0.75rem 1rem' }}>
                            <input
                              type="checkbox"
                              checked={selected.has(order.id)}
                              onChange={() => toggleOne(order.id)}
                              style={{ cursor: 'pointer', width: 15, height: 15 }}
                            />
                          </td>
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
                              style={{ fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none', color: 'var(--brand-gold)' }}
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
            )}

            {pagination && pagination.totalPages > 1 && (
              <Suspense><Pagination pagination={pagination} /></Suspense>
            )}
          </div>
        </main>
      </div>

      {/* ── Batch download progress modal ────────────────────────────────── */}
      {downloadItems && (
        <BatchProgressModal
          items={downloadItems}
          onClose={() => { setDownloadItems(null); setSelected(new Set()); }}
        />
      )}

      {/* ── Batch Pathao delivery modal ──────────────────────────────────── */}
      {batchPathaoOrders && (
        <BatchPathaoModal
          orders={batchPathaoOrders}
          itemWeight={BATCH_ITEM_WEIGHT}
          onClose={() => { setBatchPathao(null); setSelected(new Set()); }}
        />
      )}
    </ShopLayout>
  );
}
