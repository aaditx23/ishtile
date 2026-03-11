import { favouriteRepository } from '@/lib/di';
import type { PaginatedFavourites } from '@/infrastructure/convex/favouriteConvex.repository';

export async function getFavourites(
  page = 1,
  pageSize = 20,
): Promise<PaginatedFavourites> {
  return favouriteRepository.list(page, pageSize);
}
