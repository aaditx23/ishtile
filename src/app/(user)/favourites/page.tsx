import type { Metadata } from 'next';
import FavouritesView from '@/presentation/user/FavouritesView';

export const metadata: Metadata = { title: 'Favourites — Ishtile' };

export default function FavouritesPage() {
  return <FavouritesView />;
}
