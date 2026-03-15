import type { ProductDto, ProductVariantDto, ProductWithVariantsDto } from '@/shared/types/api.types';
import type { Product, ProductVariant } from '@/domain/product/product.entity';

export function mapVariant(dto: ProductVariantDto): ProductVariant {
  return {
    id:             dto.id,
    productId:      dto.productId,
    size:           dto.size,
    color:          dto.color,
    sku:            dto.sku,
    price:          dto.price,
    compareAtPrice: dto.compareAtPrice,
    quantity:       dto.quantity ?? 0,
    isActive:       dto.isActive,
  };
}

export function mapProduct(dto: ProductDto | ProductWithVariantsDto): Product {
  const variants =
    'variants' in dto ? dto.variants.map(mapVariant) : undefined;

  return {
    id:               dto.id,
    slug:             dto.slug,
    name:             dto.name,
    sku:              dto.sku,
    description:      dto.description,
    basePrice:        dto.basePrice,
    compareAtPrice:   dto.compareAtPrice,
    imageUrls:        dto.imageUrls ?? [],
    brandId:          dto.brandId,
    material:         dto.material,
    careInstructions: dto.careInstructions,
    categoryId:       dto.categoryId,
    subcategoryId:    dto.subcategoryId,
    isFeatured:       dto.isFeatured,
    trending:         dto.trending,
    isActive:         dto.isActive,
    variants,
  };
}
