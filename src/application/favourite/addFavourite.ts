import { favouriteRepository } from '@/lib/di';

export async function addFavourite(productId: number): Promise<number> {
  return favouriteRepository.add(productId);
}
