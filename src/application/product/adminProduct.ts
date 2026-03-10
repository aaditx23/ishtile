import { adminProductRepository, productRepository } from '@/lib/di';
import type { Product, ProductVariant } from '@/domain/product/product.entity';
import type { InventoryDto } from '@/shared/types/api.types';
import type {
  CreateProductPayload,
  UpdateProductPayload,
  CreateVariantPayload,
  UpdateVariantPayload,
  UpdateInventoryPayload,
} from '@/domain/product/admin-product.repository';

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  return adminProductRepository.create(payload);
}

export async function uploadProductImages(files: File[]): Promise<string[]> {
  return adminProductRepository.uploadImages(files);
}

export async function updateProduct(id: number, payload: UpdateProductPayload): Promise<Product> {
  return adminProductRepository.update(id, payload);
}

export async function deleteProduct(id: number): Promise<void> {
  return adminProductRepository.delete(id);
}

export async function getProductById(id: number): Promise<Product | null> {
  return productRepository.getById(id, true);
}

export async function createVariant(payload: CreateVariantPayload): Promise<ProductVariant> {
  return adminProductRepository.createVariant(payload);
}

export async function updateVariant(
  variantId: number,
  payload: UpdateVariantPayload,
): Promise<ProductVariant> {
  return adminProductRepository.updateVariant(variantId, payload);
}

export async function deleteVariant(variantId: number): Promise<void> {
  return adminProductRepository.deleteVariant(variantId);
}

export async function getInventory(variantId: number): Promise<InventoryDto> {
  return adminProductRepository.getInventory(variantId);
}

export async function updateInventory(
  variantId: number,
  payload: UpdateInventoryPayload,
): Promise<InventoryDto> {
  return adminProductRepository.updateInventory(variantId, payload);
}
