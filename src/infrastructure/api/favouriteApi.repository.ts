import { apiClient } from './apiClient';
import { ENDPOINTS } from './endpoints';
import type { FavouriteDto, ListFavouritesResponse, AddFavouriteResponse, RemoveFavouriteResponse } from '@/shared/types/api.types';
import type { Pagination } from '@/shared/types/api.types';

export interface PaginatedFavourites {
  items: FavouriteDto[];
  pagination: Pagination;
}

/** No domain entity for favourites yet — returns DTOs directly until domain layer is built. */
export class FavouriteApiRepository {
  async list(page = 1, pageSize = 20): Promise<PaginatedFavourites> {
    const res = await apiClient.get<ListFavouritesResponse>(ENDPOINTS.favourites.list, {
      params: { page, pageSize },
    });

    return {
      items:      res.listData,
      pagination: res.data.pagination,
    };
  }

  async add(productId: number): Promise<void> {
    await apiClient.post<AddFavouriteResponse>(ENDPOINTS.favourites.list, { productId });
  }

  async remove(favouriteId: number): Promise<void> {
    await apiClient.delete<RemoveFavouriteResponse>(ENDPOINTS.favourites.detail(favouriteId));
  }
}
