import type { Category } from './category.entity';

export interface ListCategoriesParams {
  activeOnly?: boolean;
  includeSubcategories?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CategoryRepository {
  list(params?: ListCategoriesParams): Promise<Category[]>;
}
