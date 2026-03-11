import { favouriteRepository } from '@/lib/di';

export async function toggleFavourite(productId: number): Promise<{ added: boolean; favouriteId: number | null }> {
  return favouriteRepository.toggle(productId);
}
