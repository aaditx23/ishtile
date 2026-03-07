'use client';

import Link from 'next/link';
import UserMobileNavStrip from './components/UserMobileNavStrip';
import { Skeleton } from '@/components/ui/skeleton';
import type { FavouriteDto } from '@/shared/types/api.types';

interface MobileFavouritesViewProps {
  items:        FavouriteDto[];
  loading:      boolean;
  onRemove:     (favId: number) => void;
}

const fmt = (n: number) => `৳${Number(n || 0).toFixed(0)}`;

export default function MobileFavouritesView({
  items,
  loading,
  onRemove,
}: MobileFavouritesViewProps) {
  return (
    <div style={{ padding: '1.25rem 1rem' }}>

      {/* Page title */}
      <h1 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
        Favourites
      </h1>

      <UserMobileNavStrip activeHref="/favourites" />

      {/* Favourites grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} style={{ height: '220px', borderRadius: '0.75rem' }} />
          ))}
        </div>
      ) : items.length === 0 ? (
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
          No saved items yet.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
          {items.map((fav) => (
            <div
              key={fav.id}
              style={{
                border:          '1px solid var(--border)',
                borderRadius:    '0.75rem',
                overflow:        'hidden',
                backgroundColor: 'var(--surface)',
                display:         'flex',
                flexDirection:   'column',
              }}
            >
              <Link href={`/products/${fav.productSlug}`} style={{ display: 'block', textDecoration: 'none' }}>
                <div style={{ aspectRatio: '3/4', backgroundColor: 'var(--surface-muted)', overflow: 'hidden' }}>
                  {fav.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={fav.imageUrl} alt={fav.productName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%' }} />
                  )}
                </div>
              </Link>
              <div style={{ padding: '0.625rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1 }}>
                <Link href={`/products/${fav.productSlug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, lineHeight: 1.3 }}>{fav.productName}</p>
                </Link>
                <p style={{ fontSize: '0.8rem', fontWeight: 700 }}>{fmt(fav.basePrice)}</p>
                <button
                  onClick={() => onRemove(fav.id)}
                  style={{
                    marginTop:    'auto',
                    background:   'none',
                    border:       '1px solid var(--border)',
                    borderRadius: '0.375rem',
                    padding:      '0.3rem 0.5rem',
                    fontSize:     '0.7rem',
                    cursor:       'pointer',
                    color:        'var(--destructive)',
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
