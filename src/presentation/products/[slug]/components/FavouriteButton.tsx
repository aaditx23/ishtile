'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Heart, Loader2 } from 'lucide-react';
import { toggleFavourite } from '@/application/favourite/toggleFavourite';
import { checkFavourite } from '@/application/favourite/checkFavourite';

interface FavouriteButtonProps {
  productId: number;
  /** Pass if known at render time (requires auth server-side check) */
  initialFavId?: number | null;
  /** Compact style for use inside product cards */
  compact?: boolean;
}

export default function FavouriteButton({ productId, initialFavId = null, compact = false }: FavouriteButtonProps) {
  const [favId, setFavId]       = useState<number | null>(initialFavId);
  const [loading, setLoading]   = useState(false);
  const [checking, setChecking] = useState(initialFavId === null);

  // Check favorite status on mount if not provided
  useEffect(() => {
    if (initialFavId === null) {
      checkFavourite(productId)
        .then(setFavId)
        .catch(() => setFavId(null))
        .finally(() => setChecking(false));
    }
  }, [productId, initialFavId]);

  const isFav = favId !== null;

  const handleToggle = async () => {
    setLoading(true);
    try {
      const result = await toggleFavourite(productId);
      setFavId(result.favouriteId);
      toast.success(result.added ? 'Added to favourites!' : 'Removed from favourites.');
    } catch {
      toast.error('Could not update favourites. Are you logged in?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading || checking}
      style={compact ? {
        width:           '2rem',
        height:          '2rem',
        borderRadius:    '50%',
        border:          'none',
        backgroundColor: isFav ? 'var(--brand-gold)' : 'rgba(60,60,60,0.7)',
        color:           'var(--on-primary)',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        cursor:          loading || checking ? 'not-allowed' : 'pointer',
        backdropFilter:  'blur(2px)',
        flexShrink:      0,
        opacity:         checking ? 0.5 : 1,
      } : {
        width:           '2.75rem',
        height:          '2.75rem',
        borderRadius:    '50%',
        border:          `1.5px solid ${isFav ? 'var(--brand-gold)' : 'var(--border)'}`,
        backgroundColor: isFav ? 'var(--brand-gold)' : 'transparent',
        color:           isFav ? 'var(--on-primary)' : 'var(--on-surface)',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        cursor:          loading || checking ? 'not-allowed' : 'pointer',
        transition:      'all 0.2s ease',
        flexShrink:       0,
        opacity:         checking ? 0.5 : 1,
      }}
      aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
    >
      <Heart size={compact ? 14 : 18} fill={isFav ? 'currentColor' : 'none'} className={(loading || checking) ? 'hidden' : ''} />
      {(loading || checking) && <Loader2 size={compact ? 14 : 18} className="animate-spin" />}
    </button>
  );
}
