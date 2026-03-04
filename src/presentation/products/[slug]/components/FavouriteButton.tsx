'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { FiBookmark } from 'react-icons/fi';
import { addFavourite } from '@/application/favourite/addFavourite';
import { removeFavourite } from '@/application/favourite/removeFavourite';
import { getFavourites } from '@/application/favourite/getFavourites';

interface FavouriteButtonProps {
  productId: number;
  /** Pass if known at render time (requires auth server-side check) */
  initialFavId?: number | null;
}

export default function FavouriteButton({ productId, initialFavId = null }: FavouriteButtonProps) {
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
      style={{
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
      <FiBookmark size={18} fill={isFav ? 'currentColor' : 'none'} />
    </button>
  );
}
