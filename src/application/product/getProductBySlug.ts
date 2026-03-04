import { productRepository } from '@/lib/di';
import type { Product } from '@/domain/product/product.entity';

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return productRepository.getBySlug(slug);
}
