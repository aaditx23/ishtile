import { favouriteRepository } from '@/lib/di';

export async function addFavourite(productId: number): Promise<void> {
  await favouriteRepository.add(productId);
}
