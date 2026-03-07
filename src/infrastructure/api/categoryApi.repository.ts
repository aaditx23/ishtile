import { apiClient } from './apiClient';
import { ENDPOINTS } from './endpoints';
import { mapCategory } from './mappers/category.mapper';
import type { CategoryRepository, ListCategoriesParams } from '@/domain/category/category.repository';
import type { Category } from '@/domain/category/category.entity';
import type { ListCategoriesResponse } from '@/shared/types/api.types';

export class CategoryApiRepository implements CategoryRepository {
  async list(params?: ListCategoriesParams): Promise<Category[]> {
    const res = await apiClient.get<ListCategoriesResponse>(ENDPOINTS.categories.list, {
      params: {
        activeOnly:            params?.activeOnly ?? true,
        includeSubcategories:  params?.includeSubcategories ?? true,
        page:                  params?.page,
        pageSize:              params?.pageSize ?? 100, // fetch all categories in one shot
      },
    });
    return res.listData.map(mapCategory);
  }
}
