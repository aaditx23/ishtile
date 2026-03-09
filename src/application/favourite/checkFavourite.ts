import { favouriteRepository } from '@/lib/di';

export async function checkFavourite(productId: number): Promise<number | null> {
  return favouriteRepository.checkFavourite(productId);
}
