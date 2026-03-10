import type { Product } from '@/domain/product/product.entity';
import type { Category } from '@/domain/category/category.entity';
import type { ProductCardData } from '../components/ProductCard';

/**
 * Maps a domain Product to the flat ProductCardData shape that ProductCard
 * and ProductGrid consume. Pass the categories list so we can derive the
 * human-readable category label.
 */
export function toProductCardData(
  product: Product,
  categories: Category[] = [],
): ProductCardData {
  const matchedCategory = categories.find((c) => c.id === product.categoryId);
  return {
    id:         product.id,
    slug:       product.slug,
    name:       product.name,
    category:   matchedCategory?.name ?? 'Product',
    categoryId: product.categoryId,
    brandId:    product.brandId,
    price:      product.basePrice,
    salePrice:  product.compareAtPrice ?? undefined,
    images:     product.imageUrls.length > 0 ? product.imageUrls : [],
  };
}
