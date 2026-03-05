import { apiClient } from './apiClient';
import { ENDPOINTS } from './endpoints';
import { mapProduct, mapVariant } from './mappers/product.mapper';
import type { Product, ProductVariant } from '@/domain/product/product.entity';
import type { CreateProductPayload, UpdateProductPayload, CreateVariantPayload, UpdateVariantPayload, UpdateInventoryPayload } from '@/domain/product/admin-product.repository';
import type { GetProductResponse, DataResponse, ActionResponse, ProductVariantDto, InventoryDto } from '@/shared/types/api.types';

export class AdminProductApiRepository {
  // ── Products ────────────────────────────────────────────────────────────────

  async create(payload: CreateProductPayload): Promise<Product> {
    const fd = new FormData();
    fd.append('name',        payload.name);
    fd.append('slug',        payload.slug);
    fd.append('sku',         payload.sku);
    fd.append('category_id', String(payload.categoryId));
    if (payload.subcategoryId != null) fd.append('subcategory_id', String(payload.subcategoryId));
    if (payload.description)          fd.append('description',     payload.description);
    if (payload.brand)                fd.append('brand',            payload.brand);
    if (payload.material)             fd.append('material',         payload.material);
    if (payload.careInstructions)     fd.append('care_instructions', payload.careInstructions);
    if (payload.metaTitle)            fd.append('meta_title',       payload.metaTitle);
    if (payload.metaDescription)      fd.append('meta_description', payload.metaDescription);
    fd.append('is_active',   String(payload.isActive   ?? true));
    fd.append('is_featured', String(payload.isFeatured ?? false));
    if (payload.variants?.length) {
      fd.append('variants', JSON.stringify(
        payload.variants.map((v) => ({
          size:             v.size,
          color:            v.color ?? '',
          sku:              v.sku,
          price:            v.price,
          ...(v.compareAtPrice != null ? { compare_at_price: v.compareAtPrice } : {}),
          quantity:         v.quantity,
          is_active:        v.isActive ?? true,
        }))
      ));
    }
    if (payload.images?.length) {
      payload.images.forEach((file) => fd.append('images', file));
    }
    const res = await apiClient.postFormData<GetProductResponse>(ENDPOINTS.products.list, fd);
    return mapProduct(res.data);
  }

  async update(id: number, payload: UpdateProductPayload): Promise<Product> {
    const res = await apiClient.put<GetProductResponse>(ENDPOINTS.products.detail(id), payload);
    return mapProduct(res.data);
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete<ActionResponse>(ENDPOINTS.products.detail(id));
  }

  // ── Variants ────────────────────────────────────────────────────────────────

  async createVariant(payload: CreateVariantPayload): Promise<ProductVariant> {
    const res = await apiClient.post<DataResponse<ProductVariantDto>>(
      ENDPOINTS.admin.products.variants,
      payload,
    );
    return mapVariant(res.data);
  }

  async updateVariant(variantId: number, payload: UpdateVariantPayload): Promise<ProductVariant> {
    const res = await apiClient.put<DataResponse<ProductVariantDto>>(
      ENDPOINTS.admin.products.variant(variantId),
      payload,
    );
    return mapVariant(res.data);
  }

  // ── Inventory ───────────────────────────────────────────────────────────────

  async getInventory(variantId: number): Promise<InventoryDto> {
    const res = await apiClient.get<DataResponse<InventoryDto>>(
      ENDPOINTS.admin.products.inventory(variantId),
    );
    return res.data;
  }

  async updateInventory(variantId: number, payload: UpdateInventoryPayload): Promise<InventoryDto> {
    const res = await apiClient.put<DataResponse<InventoryDto>>(
      ENDPOINTS.admin.products.inventory(variantId),
      payload,
    );
    return res.data;
  }
}
