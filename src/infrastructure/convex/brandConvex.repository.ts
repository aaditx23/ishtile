import { convex } from './convexClient';
import { asId, fromId } from './convexHelpers';
import { api } from '../../../convex/_generated/api';
import { apiClient } from '@/infrastructure/api/apiClient';
import { ENDPOINTS } from '@/infrastructure/api/endpoints';
import type { ApiResponse } from '@/shared/types/api.types';
import type { BrandRepository, AdminBrandRepository, ListBrandsParams, CreateBrandPayload, UpdateBrandPayload } from '@/domain/brand/brand.repository';
import type { Brand } from '@/domain/brand/brand.entity';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBrand(b: any): Brand {
  return {
    id:           asId(b._id),
    name:         b.name,
    slug:         b.slug,
    imageUrl:     b.imageUrl ?? null,
    description:  b.description ?? null,
    displayOrder: b.displayOrder,
    isActive:     b.isActive,
  };
}

export class BrandConvexRepository implements BrandRepository {
  async list(params?: ListBrandsParams): Promise<Brand[]> {
    const res = await convex.query(api.brands.queries.listBrands, {
      page:       params?.page ?? 1,
      pageSize:   params?.pageSize ?? 100,
      activeOnly: params?.activeOnly ?? true,
    });
    return res.items.map(mapBrand);
  }

  async getById(id: number): Promise<Brand | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await convex.query(api.brands.queries.getBrandById, { id: fromId(id) as any });
    return res ? mapBrand(res) : null;
  }

  async getBySlug(slug: string): Promise<Brand | null> {
    const res = await convex.query(api.brands.queries.getBrandBySlug, { slug });
    return res ? mapBrand(res) : null;
  }
}

export class AdminBrandConvexRepository implements AdminBrandRepository {
  // ── Image Upload — uses file API (Cloudinary) ────────────────────────────────

  async uploadImage(file: File): Promise<string> {
    const fd = new FormData();
    fd.append('files', file);
    const res = await apiClient.postFormData<ApiResponse>(ENDPOINTS.files.upload('brands'), fd);
    const urls = (res.listData ?? []) as string[];
    return urls[0] ?? '';
  }

  // ── Brands ───────────────────────────────────────────────────────────────────

  async create(payload: CreateBrandPayload): Promise<Brand> {
    const result = await convex.mutation(api.brands.mutations.createBrand, {
      name:         payload.name,
      slug:         payload.slug,
      imageUrl:     payload.imageUrl,
      description:  payload.description,
      displayOrder: payload.displayOrder ?? 0,
      isActive:     payload.isActive ?? true,
    });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const brand = await convex.query(api.brands.queries.getBrandById, { id: result.id as any });
    if (!brand) throw new Error('Brand not found after creation');
    return mapBrand(brand);
  }

  async update(id: number, payload: UpdateBrandPayload): Promise<Brand> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await convex.mutation(api.brands.mutations.updateBrand, { id: fromId(id) as any, ...payload });
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const brand = await convex.query(api.brands.queries.getBrandById, { id: fromId(id) as any });
    if (!brand) throw new Error('Brand not found after update');
    return mapBrand(brand);
  }

  async delete(id: number): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await convex.mutation(api.brands.mutations.deleteBrand, { id: fromId(id) as any });
  }
}
