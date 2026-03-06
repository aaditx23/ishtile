'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Heart, Loader2 } from 'lucide-react';
import { addFavourite } from '@/application/favourite/addFavourite';
import { removeFavourite } from '@/application/favourite/removeFavourite';
import { getFavourites } from '@/application/favourite/getFavourites';

interface FavouriteButtonProps {
  productId: number;
  /** Pass if known at render time (requires auth server-side check) */
  initialFavId?: number | null;
  /** Compact style for use inside product cards */
  compact?: boolean;
}

export default function FavouriteButton({ productId, initialFavId = null, compact = false }: FavouriteButtonProps) {
  const [favId, setFavId]   = useState<number | null>(initialFavId);
  const [loading, setLoading] = useState(false);

  const isFav = favId !== null;

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (isFav) {
        // We already have the favId stored from a previous add
        await removeFavourite(favId);
        setFavId(null);
        toast.success('Removed from favourites.');
      } else {
        // Add to favourites — then look it up to get the new favId
        await addFavourite(productId);
        const favs = await getFavourites(1);
        const match = favs.items.find((f) => f.productId === productId);
        setFavId(match?.id ?? -1); // -1 signals "added but id unknown"
        toast.success('Added to favourites!');
      }
    } catch {
      toast.error('Could not update favourites. Are you logged in?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      style={compact ? {
        width:           '2rem',
        height:          '2rem',
        borderRadius:    '50%',
        border:          'none',
        backgroundColor: isFav ? 'var(--brand-gold)' : 'rgba(60,60,60,0.7)',
        color:           '#fff',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        cursor:          loading ? 'not-allowed' : 'pointer',
        backdropFilter:  'blur(2px)',
        flexShrink:      0,
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
        cursor:          loading ? 'not-allowed' : 'pointer',
        transition:      'all 0.2s ease',
        flexShrink:       0,
      }}
      aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
    >
      <Heart size={compact ? 14 : 18} fill={isFav ? 'currentColor' : 'none'} className={loading ? 'hidden' : ''} />
      {loading && <Loader2 size={compact ? 14 : 18} className="animate-spin" />}
    </button>
  );
}
