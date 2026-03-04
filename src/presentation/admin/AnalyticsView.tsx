'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import AdminLayout from './AdminLayout';
import { getDailySales } from '@/application/analytics/getDailySales';
import { getProductSales } from '@/application/analytics/getProductSales';
import { getPromoSales } from '@/application/analytics/getPromoSales';
import type { DailySalesDto, ProductSalesDto, PromoSalesDto } from '@/shared/types/api.types';

interface AnalyticsData {
  dailySales:   DailySalesDto[];
  productSales: ProductSalesDto[];
  promoSales:   PromoSalesDto[];
}

const fmt  = (n: number) => `৳${n.toLocaleString('en-BD')}`;
const fmtD = (s: string) => new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

const sectionStyle: React.CSSProperties = {
  border:          '1px solid var(--border)',
  borderRadius:    '0.75rem',
  padding:         '1.25rem',
  backgroundColor: 'var(--surface)',
};

const headingStyle: React.CSSProperties = {
  fontSize:      '0.7rem',
  fontWeight:    700,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color:         'var(--on-surface-muted)',
  marginBottom:  '1.25rem',
};

function BarChart({ data }: { data: DailySalesDto[] }) {
  if (data.length === 0) {
    return <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-muted)' }}>No data available.</p>;
  }
  const maxRev = Math.max(...data.map((d) => d.totalRevenue), 1);

  return (
    <div>
      {/* Y-axis label */}
      <div
        style={{
          display:        'flex',
          alignItems:     'flex-end',
          gap:            '3px',
          height:         '120px',
          overflowX:      'auto',
          overflowY:      'visible',
          paddingBottom:  '0.25rem',
        }}
      >
        {data.map((d) => {
          const pct = d.totalRevenue / maxRev;
          return (
            <div
              key={d.summaryDate}
              title={`${fmtD(d.summaryDate)}: ${fmt(d.totalRevenue)} (${d.totalOrders} orders)`}
              style={{
                flex:         '1 0 auto',
                minWidth:     '8px',
                maxWidth:     '28px',
                height:       `${Math.max(pct * 100, 2)}%`,
                borderRadius: '3px 3px 0 0',
                backgroundColor: 'var(--brand-gold)',
                opacity:      0.85,
              }}
            />
          );
        })}
      </div>
      {/* X-axis labels (every ~7th) */}
      <div style={{ display: 'flex', gap: '3px', marginTop: '0.25rem', overflow: 'hidden' }}>
        {data.map((d, i) => (
          <div key={d.summaryDate} style={{ flex: '1 0 auto', minWidth: '8px', maxWidth: '28px' }}>
            {i % 7 === 0 && (
              <p style={{ fontSize: '0.6rem', color: 'var(--on-surface-muted)', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                {fmtD(d.summaryDate)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsView() {
  const [data, setData]       = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const end   = new Date().toISOString().slice(0, 10);
    const start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    Promise.all([getDailySales(start, end), getProductSales(10), getPromoSales(10)])
      .then(([dailySales, productSales, promoSales]) => setData({ dailySales, productSales, promoSales }))
      .catch(() => toast.error('Failed to load analytics.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <AdminLayout activeHref="/admin/analytics">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Analytics</h1>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[1,2].map((i) => <Skeleton key={i} style={{ height: '5rem', borderRadius: '0.75rem' }} />)}
          </div>
          <Skeleton style={{ height: '10rem', borderRadius: '0.75rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {[1,2].map((i) => <Skeleton key={i} style={{ height: '14rem', borderRadius: '0.75rem' }} />)}
          </div>
        </div>
      </AdminLayout>
    );
  }

  const { dailySales, productSales, promoSales } = data;
  const totalRevenue = dailySales.reduce((s, d) => s + d.totalRevenue, 0);
  const totalOrders  = dailySales.reduce((s, d) => s + d.totalOrders, 0);

  return (
    <AdminLayout activeHref="/admin/analytics">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Analytics</h1>

        {/* Summary row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Total Revenue (30d)',  value: fmt(totalRevenue) },
            { label: 'Total Orders (30d)',   value: totalOrders },
          ].map(({ label, value }) => (
            <div key={label} style={{ ...sectionStyle, padding: '1rem' }}>
              <p style={{ ...headingStyle, marginBottom: '0.375rem' }}>{label}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800 }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Daily revenue bar chart */}
        <div style={sectionStyle}>
          <p style={headingStyle}>Daily Revenue (last 30 days)</p>
          <BarChart data={dailySales} />
        </div>

        {/* Top products + promo usage side-by-side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Top products */}
          <div style={sectionStyle}>
            <p style={headingStyle}>Top Products</p>
            {productSales.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-muted)' }}>No data.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {productSales.map((p, i) => (
                  <div key={`${p.productId}-${p.variantId}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--on-surface-muted)', width: '1.25rem', flexShrink: 0 }}>{i + 1}</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.productName}{p.variantSize ? ` (${p.variantSize})` : ''}
                      </span>
                    </div>
                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      <p style={{ fontWeight: 700 }}>{fmt(p.totalRevenue)}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-muted)' }}>{p.totalQuantitySold} sold</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Promo usage */}
          <div style={sectionStyle}>
            <p style={headingStyle}>Promo Usage</p>
            {promoSales.length === 0 ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-muted)' }}>No data.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {promoSales.map((p) => (
                  <div key={p.promoId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.78rem' }}>{p.promoCode}</span>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 700 }}>{p.totalUses} uses</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--on-surface-muted)' }}>−{fmt(p.totalDiscountGiven)} given</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
