'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import UserLayout from './UserLayout';
import { getFavourites } from '@/application/favourite/getFavourites';
import { removeFavourite } from '@/application/favourite/removeFavourite';
import type { FavouriteDto } from '@/shared/types/api.types';

const fmt = (n: number) => `৳${Number(n || 0).toFixed(0)}`;

export default function FavouritesView() {
  const [items, setItems]     = useState<FavouriteDto[]>([]);
  const [loading, setLoading] = useState(true);
  const initRef               = useRef(false);

  const fetchFavs = useCallback(async () => {
    try {
      const result = await getFavourites(1, 50);
      setItems(result.items);
    } catch {
      toast.error('Failed to load favourites.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    fetchFavs();
  }, [fetchFavs]);

  const handleRemove = async (favId: number) => {
    try {
      await removeFavourite(favId);
      setItems((prev) => prev.filter((f) => f.id !== favId));
    } catch {
      toast.error('Could not remove favourite.');
    }
  };

  return (
    <UserLayout activeHref="/favourites">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Favourites</h1>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
            {[1,2,3,4,5,6].map((i) => (
              <Skeleton key={i} style={{ height: '220px', borderRadius: '0.75rem' }} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--border)', borderRadius: '0.75rem', color: 'var(--on-surface-muted)', fontSize: '0.9rem' }}>
            No saved items yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
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
                <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
                  <Link href={`/products/${fav.productSlug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.3 }}>{fav.productName}</p>
                  </Link>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700 }}>{fmt(fav.basePrice)}</p>
                  <button
                    onClick={() => handleRemove(fav.id)}
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
    </UserLayout>
  );
}
