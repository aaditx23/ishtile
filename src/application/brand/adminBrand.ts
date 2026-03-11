import { AdminBrandConvexRepository } from '@/infrastructure/convex/brandConvex.repository';
import type { Brand } from '@/domain/brand/brand.entity';
import type { CreateBrandPayload, UpdateBrandPayload } from '@/domain/brand/brand.repository';

const adminBrandRepository = new AdminBrandConvexRepository();

export async function createBrand(payload: CreateBrandPayload): Promise<Brand> {
  return await adminBrandRepository.create(payload);
}

export async function updateBrand(id: number, payload: UpdateBrandPayload): Promise<Brand> {
  return await adminBrandRepository.update(id, payload);
}

export async function deleteBrand(id: number): Promise<void> {
  return await adminBrandRepository.delete(id);
}

export async function uploadBrandImage(file: File): Promise<string> {
  return await adminBrandRepository.uploadImage(file);
}
