import type { Product } from './product.entity';
import type { Pagination } from '@/shared/types/api.types';

export interface ListProductsParams {
  page?: number;
  pageSize?: number;
  categoryId?: number;
  subcategoryId?: number;
  brand?: string;
  search?: string;
  isFeatured?: boolean;
  activeOnly?: boolean;
  includeVariants?: boolean;
}

export interface PaginatedProducts {
  items: Product[];
  pagination: Pagination;
}

export interface ProductRepository {
  list(params?: ListProductsParams): Promise<PaginatedProducts>;
  getById(id: number, includeVariants?: boolean): Promise<Product | null>;
  /** Fetches by listing with search=slug and returns first match. */
  getBySlug(slug: string): Promise<Product | null>;
}
