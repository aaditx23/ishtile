import { convex } from './convexClient';
import { asId, fromId } from './convexHelpers';
import { api } from '../../../convex/_generated/api';
import { requireConvexUserId } from './convexAuth';
import { apiClient } from '@/infrastructure/api/apiClient';
import { ENDPOINTS } from '@/infrastructure/api/endpoints';
import type { Product, ProductVariant } from '@/domain/product/product.entity';
import type {
  CreateProductPayload,
  UpdateProductPayload,
  CreateVariantPayload,
  UpdateVariantPayload,
  UpdateInventoryPayload,
} from '@/domain/product/admin-product.repository';
import type { ApiResponse, DataResponse, InventoryDto, ProductVariantDto } from '@/shared/types/api.types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapVariant(v: any): ProductVariant {
  return {
    id: asId(v._id ?? v.id), productId: asId(v.productId),
    size: v.size, color: v.color ?? null, sku: v.sku,
    price: v.price, compareAtPrice: v.compareAtPrice ?? null,
    quantity: v.quantity ?? 0, isActive: v.isActive,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProduct(p: any): Product {
  return {
    id: asId(p._id ?? p.id), slug: p.slug, name: p.name, sku: p.sku,
    description: p.description ?? null, basePrice: p.basePrice,
    compareAtPrice: p.compareAtPrice ?? null, imageUrls: p.imageUrls ?? [],
    brand: p.brand ?? null, material: p.material ?? null,
    careInstructions: p.careInstructions ?? null,
    categoryId: asId(p.categoryId), subcategoryId: p.subcategoryId ? asId(p.subcategoryId) : null,
    isFeatured: p.isFeatured, isActive: p.isActive,
    variants: p.variants ? p.variants.map(mapVariant) : undefined,
  };
}

export class AdminProductConvexRepository {
  // ── Image Upload — still uses the existing file API (Cloudinary) ────────────

  async uploadImages(files: File[], folder = 'products'): Promise<string[]> {
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    const res = await apiClient.postFormData<ApiResponse>(ENDPOINTS.files.upload(folder), fd);
    return (res.listData ?? []) as string[];
  }

  // ── Products ────────────────────────────────────────────────────────────────

  async create(payload: CreateProductPayload): Promise<Product> {
    const adminUserId = requireConvexUserId();
    const result = await convex.mutation(api.products.mutations.createProduct, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      categoryId:      fromId(payload.categoryId) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      subcategoryId:   payload.subcategoryId ? fromId(payload.subcategoryId) as any : undefined,
      name:            payload.name,
      sku:             payload.sku,
      description:     payload.description,
      imageUrls:       payload.imageUrls ?? [],
      material:        payload.material,
      careInstructions: payload.careInstructions,
      brand:           payload.brand,
      isActive:        payload.isActive,
      isFeatured:      payload.isFeatured,
      metaTitle:       payload.metaTitle,
      metaDescription: payload.metaDescription,
      compareAtPrice:  payload.compareAtPrice,
      variants:        (payload.variants ?? []).map((v) => ({
        size: v.size, color: v.color, sku: v.sku, price: v.price,
        compareAtPrice: v.compareAtPrice, weightGrams: v.weightGrams,
        quantity: v.quantity ?? 0,
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      adminUserId: adminUserId as any,
    });
    
    // Extract the product ID string from the mutation result
    const { id: productId } = result as { id: string };
    
    // Fetch created product
    const res = await convex.query(api.products.queries.getProductById, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      id: productId as any,
      includeVariants: true,
    });
    if (!res) throw new Error('Product not found after creation');
    return mapProduct(res);
  }

  async update(id: number, payload: UpdateProductPayload): Promise<Product> {
    const adminUserId = requireConvexUserId();
    await convex.mutation(api.products.mutations.updateProduct, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      id:              fromId(id) as any,
      name:            payload.name,
      sku:             payload.sku,
      description:     payload.description,
      imageUrls:       payload.imageUrls,
      material:        payload.material,
      careInstructions: payload.careInstructions,
      brand:           payload.brand,
      isActive:        payload.isActive,
      isFeatured:      payload.isFeatured,
      basePrice:       payload.basePrice,
      compareAtPrice:  payload.compareAtPrice,
      metaTitle:       payload.metaTitle,
      metaDescription: payload.metaDescription,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      categoryId:      payload.categoryId ? fromId(payload.categoryId) as any : undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      subcategoryId:   payload.subcategoryId ? fromId(payload.subcategoryId) as any : undefined,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      adminUserId:     adminUserId as any,
    });
    const res = await convex.query(api.products.queries.getProductById, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      id: fromId(id) as any,
      includeVariants: true,
    });
    if (!res) throw new Error('Product not found after update');
    return mapProduct(res);
  }

  async delete(id: number): Promise<void> {
    const adminUserId = requireConvexUserId();
    await convex.mutation(api.products.mutations.deleteProduct, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      id:          fromId(id) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      adminUserId: adminUserId as any,
    });
  }

  // ── Variants ────────────────────────────────────────────────────────────────

  async createVariant(payload: CreateVariantPayload): Promise<ProductVariant> {
    const adminUserId = requireConvexUserId();
    const res = await convex.mutation(api.products.mutations.createVariant, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      productId:     fromId(payload.productId) as any,
      size:          payload.size,
      color:         payload.color,
      sku:           payload.sku,
      price:         payload.price,
      compareAtPrice: payload.compareAtPrice,
      weightGrams:   payload.weightGrams,
      isActive:      payload.isActive,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      adminUserId:   adminUserId as any,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const v: any = { _id: (res as any).id, ...payload, quantity: 0, isActive: payload.isActive ?? true };
    return mapVariant(v);
  }

  async updateVariant(variantId: number, payload: UpdateVariantPayload): Promise<ProductVariant> {
    const adminUserId = requireConvexUserId();
    await convex.mutation(api.products.mutations.updateVariant, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      id:            fromId(variantId) as any,
      size:          payload.size,
      color:         payload.color,
      sku:           payload.sku,
      price:         payload.price,
      compareAtPrice: payload.compareAtPrice,
      weightGrams:   payload.weightGrams,
      isActive:      payload.isActive,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      adminUserId:   adminUserId as any,
    });
    // Return a minimal shape; caller typically re-fetches the product
    return { id: variantId, productId: 0, size: payload.size ?? '', color: payload.color ?? null,
      sku: payload.sku ?? '', price: payload.price ?? 0, compareAtPrice: null,
      quantity: 0, isActive: payload.isActive ?? true };
  }

  // ── Inventory ───────────────────────────────────────────────────────────────

  async getInventory(variantId: number): Promise<InventoryDto> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const inv = await convex.query(api.admin.queries.getInventory, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      variantId: fromId(variantId) as any,
    });
    
    if (!inv) {
      throw new Error('Inventory not found');
    }
    
    return {
      id: asId(inv._id),
      variantId: asId(inv.variantId),
      quantity: inv.quantity,
      reservedQuantity: inv.reservedQuantity,
      availableQuantity: inv.availableQuantity,
      updatedAt: new Date(inv._creationTime).toISOString(),
    };
  }

  async updateInventory(variantId: number, payload: UpdateInventoryPayload): Promise<InventoryDto> {
    const adminUserId = requireConvexUserId();
    await convex.mutation(api.admin.mutations.adjustInventory, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      variantId:   fromId(variantId) as any,
      newQuantity: payload.quantity,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      adminUserId: adminUserId as any,
    });
    // Return a minimal InventoryDto shape; caller re-fetches if needed
    return { id: variantId, variantId, quantity: payload.quantity,
      reservedQuantity: 0, availableQuantity: payload.quantity, updatedAt: new Date().toISOString() };
  }
}
