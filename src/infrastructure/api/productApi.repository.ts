import { apiClient } from './apiClient';
import { ENDPOINTS } from './endpoints';
import { mapProduct } from './mappers/product.mapper';
import type { ProductRepository, ListProductsParams, PaginatedProducts } from '@/domain/product/product.repository';
import type { Product } from '@/domain/product/product.entity';
import type { ListProductsResponse, GetProductResponse } from '@/shared/types/api.types';

export class ProductApiRepository implements ProductRepository {
  async list(params?: ListProductsParams): Promise<PaginatedProducts> {
    const res = await apiClient.get<ListProductsResponse>(ENDPOINTS.products.list, {
      params: {
        page:            params?.page,
        pageSize:        params?.pageSize,
        categoryId:      params?.categoryId,
        subcategoryId:   params?.subcategoryId,
        brand:           params?.brand,
        search:          params?.search,
        isFeatured:      params?.isFeatured,
        activeOnly:      params?.activeOnly,
        includeVariants: params?.includeVariants,
      },
    });

    return {
      items:      res.listData.map(mapProduct),
      pagination: res.data.pagination,
    };
  }

  async getById(id: number, includeVariants = false): Promise<Product | null> {
    try {
      const res = await apiClient.get<GetProductResponse>(ENDPOINTS.products.detail(id), {
        params: { includeVariants },
      });
      return mapProduct(res.data);
    } catch {
      return null;
    }
  }

  async getBySlug(slug: string): Promise<Product | null> {
    const res = await apiClient.get<ListProductsResponse>(ENDPOINTS.products.list, {
      params: { search: slug, pageSize: 10, includeVariants: true },
    });
    const match = res.listData.find((p) => p.slug === slug);
    return match ? mapProduct(match) : null;
  }
}
