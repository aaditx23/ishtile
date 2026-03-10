import { convex } from './convexClient';
import { asId, fromId, buildPagination } from './convexHelpers';
import { api } from '../../../convex/_generated/api';
import type { ProductRepository, ListProductsParams, PaginatedProducts } from '@/domain/product/product.repository';
import type { Product, ProductVariant } from '@/domain/product/product.entity';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapVariant(v: any): ProductVariant {
  return {
    id:             asId(v._id),
    productId:      asId(v.productId),
    size:           v.size,
    color:          v.color ?? null,
    sku:            v.sku,
    price:          v.price,
    compareAtPrice: v.compareAtPrice ?? null,
    quantity:       v.quantity ?? 0,
    isActive:       v.isActive,
    stock:          v.stock ?? 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProduct(p: any): Product {
  return {
    id:               asId(p._id),
    slug:             p.slug,
    name:             p.name,
    sku:              p.sku,
    description:      p.description ?? null,
    basePrice:        p.basePrice,
    compareAtPrice:   p.compareAtPrice ?? null,
    imageUrls:        p.imageUrls ?? [],
    brandId:          p.brandId ? asId(p.brandId) : null,
    material:         p.material ?? null,
    careInstructions: p.careInstructions ?? null,
    categoryId:       asId(p.categoryId),
    subcategoryId:    p.subcategoryId ? asId(p.subcategoryId) : null,
    isFeatured:       p.isFeatured,
    isActive:         p.isActive,
    variants:         p.variants ? p.variants.map(mapVariant) : undefined,
  };
}

export class ProductConvexRepository implements ProductRepository {
  async list(params?: ListProductsParams): Promise<PaginatedProducts> {
    const res = await convex.query(api.products.queries.listProducts, {
      page:            params?.page ?? 1,
      pageSize:        params?.pageSize ?? 20,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      categoryId:      params?.categoryId ? fromId(params.categoryId) as any : undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      subcategoryId:   params?.subcategoryId ? fromId(params.subcategoryId) as any : undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      brandId:         params?.brandId ? fromId(params.brandId) as any : undefined,
      search:          params?.search,
      isFeatured:      params?.isFeatured,
      activeOnly:      params?.activeOnly ?? true,
      includeVariants: params?.includeVariants ?? false,
    });

    return {
      items:      res.items.map(mapProduct),
      pagination: buildPagination(res.total, res.page, res.pageSize),
    };
  }

  async getById(id: number, includeVariants = false): Promise<Product | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await convex.query(api.products.queries.getProductById, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      id: fromId(id) as any,
      includeVariants,
    });
    if (!res) return null;
    return mapProduct(res);
  }

  async getBySlug(slug: string): Promise<Product | null> {
    const res = await convex.query(api.products.queries.getProductBySlug, {
      slug,
      includeVariants: true,
    });
    if (!res) return null;
    return mapProduct(res);
  }
}
