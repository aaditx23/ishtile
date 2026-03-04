import { favouriteRepository } from '@/lib/di';
import type { PaginatedFavourites } from '@/infrastructure/api/favouriteApi.repository';

export async function getFavourites(
  page = 1,
  pageSize = 20,
): Promise<PaginatedFavourites> {
  return favouriteRepository.list(page, pageSize);
}
