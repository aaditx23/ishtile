import { productRepository } from '@/lib/di';
import type { ListProductsParams, PaginatedProducts } from '@/domain/product/product.repository';

export async function getProducts(params?: ListProductsParams): Promise<PaginatedProducts> {
  return productRepository.list(params);
}
