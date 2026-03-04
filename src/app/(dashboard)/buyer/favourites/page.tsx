import type { Metadata } from 'next';
import FavouritesView from '@/presentation/buyer/FavouritesView';

export const metadata: Metadata = { title: 'Favourites — Ishtyle' };

export default function BuyerFavouritesPage() {
  return <FavouritesView />;
}
