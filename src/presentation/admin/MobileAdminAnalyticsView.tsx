'use client';

import { Skeleton } from '@/components/ui/skeleton';
import AdminMobileNavStrip from './components/AdminMobileNavStrip';
import type { DailySalesDto, ProductSalesDto, PromoSalesDto } from '@/shared/types/api.types';

const fmt  = (n: number) => `৳${n.toLocaleString('en-BD')}`;
const fmtD = (s: string) => new Date(s).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

const sectionStyle: React.CSSProperties = {
  border:          '1px solid var(--border)',
  borderRadius:    '0.75rem',
  padding:         '1rem',
  backgroundColor: 'var(--surface)',
};

const headingStyle: React.CSSProperties = {
  fontSize:      '0.65rem',
  fontWeight:    700,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color:         'var(--on-surface-muted)',
  marginBottom:  '0.875rem',
};

function BarChart({ data }: { data: DailySalesDto[] }) {
  if (data.length === 0) {
    return <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-muted)' }}>No data available.</p>;
  }
  const maxRev = Math.max(...data.map((d) => d.totalRevenue), 1);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '100px', paddingBottom: '0.25rem' }}>
        {data.map((d) => {
          const pct = d.totalRevenue / maxRev;
          return (
            <div
              key={d.summaryDate}
              title={`${fmtD(d.summaryDate)}: ${fmt(d.totalRevenue)} (${d.totalOrders} orders)`}
              style={{
                flex:            '1 0 auto',
                minWidth:        '6px',
                maxWidth:        '24px',
                height:          `${Math.max(pct * 100, 2)}%`,
                borderRadius:    '2px 2px 0 0',
                backgroundColor: 'var(--brand-gold)',
                opacity:         0.85,
              }}
            />
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: '2px', marginTop: '0.2rem', overflow: 'hidden' }}>
        {data.map((d, i) => (
          <div key={d.summaryDate} style={{ flex: '1 0 auto', minWidth: '6px', maxWidth: '24px' }}>
            {i % 7 === 0 && (
              <p style={{ fontSize: '0.55rem', color: 'var(--on-surface-muted)', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                {fmtD(d.summaryDate)}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface MobileAdminAnalyticsViewProps {
  loading:         boolean;
  totalRevenue:    number;
  totalOrders:     number;
  dailySales:      DailySalesDto[];
  productSales:    ProductSalesDto[];
  promoSales:      PromoSalesDto[];
}

export default function MobileAdminAnalyticsView({
  loading,
  totalRevenue,
  totalOrders,
  dailySales,
  productSales,
  promoSales,
}: MobileAdminAnalyticsViewProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1.25rem 1rem' }}>
        <AdminMobileNavStrip activeHref="/admin/analytics" />
      </div>

      <div style={{ padding: '0 1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Analytics</h1>

        {loading ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {[1, 2].map((i) => <Skeleton key={i} style={{ height: '5rem', borderRadius: '0.75rem' }} />)}
            </div>
            <Skeleton style={{ height: '9rem', borderRadius: '0.75rem' }} />
            <Skeleton style={{ height: '12rem', borderRadius: '0.75rem' }} />
            <Skeleton style={{ height: '10rem', borderRadius: '0.75rem' }} />
          </>
        ) : (
          <>
            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={sectionStyle}>
                <p style={{ ...headingStyle, marginBottom: '0.25rem' }}>Revenue (30d)</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>{fmt(totalRevenue)}</p>
              </div>
              <div style={sectionStyle}>
                <p style={{ ...headingStyle, marginBottom: '0.25rem' }}>Orders (30d)</p>
                <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>{totalOrders}</p>
              </div>
            </div>

            {/* Bar chart */}
            <div style={sectionStyle}>
              <p style={headingStyle}>Daily Revenue (last 30 days)</p>
              <BarChart data={dailySales} />
            </div>

            {/* Top products */}
            <div style={sectionStyle}>
              <p style={headingStyle}>Top Products</p>
              {productSales.length === 0 ? (
                <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-muted)' }}>No data.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {productSales.map((p, i) => (
                    <div key={`${p.productId}-${p.variantId}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', minWidth: 0 }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--on-surface-muted)', width: '1.1rem', flexShrink: 0 }}>{i + 1}</span>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
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
          </>
        )}
      </div>
    </div>
  );
}
