import { productRepository } from '@/lib/di';
import type { Product } from '@/domain/product/product.entity';

export async function getProductById(id: number, includeVariants = false): Promise<Product | null> {
    return productRepository.getById(id, includeVariants);
}
