'use client';

import { Skeleton } from '@/components/ui/skeleton';
import AdminMobileNavStrip from './components/AdminMobileNavStrip';
import type { PromoDto } from '@/domain/promo/promo.entity';

interface MobileAdminPromosViewProps {
  promos:        PromoDto[];
  loading:       boolean;
  onNew:         () => void;
  onEdit:        (p: PromoDto) => void;
  onDelete:      (id: number, code: string) => void;
}

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
}

export default function MobileAdminPromosView({
  promos,
  loading,
  onNew,
  onEdit,
  onDelete,
}: MobileAdminPromosViewProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '60vh' }}>
      <div style={{ padding: '1.25rem 1rem' }}>
        <AdminMobileNavStrip activeHref="/admin/promos" />
      </div>

      <div style={{ padding: '0 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem', flex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Promos</h1>
          <button
            onClick={onNew}
            style={{
              display:         'inline-flex',
              alignItems:      'center',
              gap:             '0.25rem',
              padding:         '0.45rem 0.875rem',
              backgroundColor: 'var(--primary)',
              color:           'var(--on-primary)',
              border:          'none',
              fontSize:        '0.78rem',
              fontWeight:      700,
              cursor:          'pointer',
            }}
          >
            + New
          </button>
        </div>

        {/* Loading */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} style={{ height: '6rem' }} />
            ))}
          </div>
        ) : promos.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--on-surface-muted)', fontSize: '0.875rem', marginTop: '3rem' }}>
            No promos yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {promos.map((p) => (
              <div
                key={p.id}
                style={{
                  border:          '1px solid var(--border)',
                  padding:         '0.875rem 1rem',
                  backgroundColor: 'var(--surface)',
                  display:         'flex',
                  flexDirection:   'column',
                  gap:             '0.5rem',
                }}
              >
                {/* Row 1: code + status badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.05em' }}>
                    {p.code}
                  </span>
                  <span
                    style={{
                      fontSize:        '0.65rem',
                      fontWeight:      700,
                      textTransform:   'uppercase',
                      letterSpacing:   '0.05em',
                      padding:         '0.2rem 0.5rem',
                      backgroundColor: p.isActive ? '#d1fae5' : '#fee2e2',
                      color:           p.isActive ? '#065f46' : '#991b1b',
                      flexShrink:      0,
                    }}
                  >
                    {p.isActive ? 'Active' : 'Off'}
                  </span>
                </div>

                {/* Row 2: value + type + min order */}
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--on-surface-muted)' }}>
                  <span>
                    <strong style={{ color: 'var(--on-surface)' }}>
                      {p.discountType === 'percentage' ? `${p.discountValue}%` : `৳${p.discountValue}`}
                    </strong>
                    {' '}off
                  </span>
                  {p.minimumOrderValue != null && (
                    <span>Min ৳{p.minimumOrderValue}</span>
                  )}
                  {p.expiresAt && (
                    <span>Expires {fmtDate(p.expiresAt)}</span>
                  )}
                  <span>
                    Uses: {p.currentUses}{p.maxTotalUses ? `/${p.maxTotalUses}` : ''}
                  </span>
                </div>

                {/* Row 3: actions */}
                <div style={{ display: 'flex', gap: '1rem', paddingTop: '0.25rem', borderTop: '1px solid var(--border)' }}>
                  <button
                    onClick={() => onEdit(p)}
                    style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-gold)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(p.id, p.code)}
                    style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--destructive)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
