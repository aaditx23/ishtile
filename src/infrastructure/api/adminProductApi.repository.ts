import { apiClient } from './apiClient';
import { ENDPOINTS } from './endpoints';
import { mapProduct, mapVariant } from './mappers/product.mapper';
import type { Product, ProductVariant } from '@/domain/product/product.entity';
import type { CreateProductPayload, UpdateProductPayload, CreateVariantPayload, UpdateVariantPayload, UpdateInventoryPayload } from '@/domain/product/admin-product.repository';
import type { GetProductResponse, DataResponse, ActionResponse, ProductVariantDto, InventoryDto } from '@/shared/types/api.types';

export class AdminProductApiRepository {
  // ── Products ────────────────────────────────────────────────────────────────

  async create(payload: CreateProductPayload): Promise<Product> {
    const res = await apiClient.post<GetProductResponse>(ENDPOINTS.products.list, payload);
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
