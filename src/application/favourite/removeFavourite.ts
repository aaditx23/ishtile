import { favouriteRepository } from '@/lib/di';

export async function removeFavourite(favouriteId: number): Promise<void> {
  await favouriteRepository.remove(favouriteId);
}
