import { convex } from './convexClient';
import { asId, fromId } from './convexHelpers';
import { api } from '../../../convex/_generated/api';
import { apiClient } from '@/infrastructure/api/apiClient';
import { ENDPOINTS } from '@/infrastructure/api/endpoints';
import type { ApiResponse, CategoryDto, SubcategoryDto } from '@/shared/types/api.types';
import type { CategoryPayload, SubcategoryPayload } from '@/infrastructure/api/adminCategoryApi.repository';

const NOW = () => new Date().toISOString();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCategory(c: any): CategoryDto {
  return {
    id: asId(c._id ?? c.id),
    name: c.name,
    slug: c.slug,
    description: c.description ?? null,
    imageUrl: c.imageUrl ?? null,
    displayOrder: c.displayOrder ?? 0,
    isActive: c.isActive,
    createdAt: c._creationTime ? new Date(c._creationTime).toISOString() : NOW(),
    updatedAt: NOW(),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSubcategory(s: any): SubcategoryDto {
  return {
    id: asId(s._id ?? s.id),
    categoryId: asId(s.categoryId),
    name: s.name,
    slug: s.slug,
    description: s.description ?? null,
    imageUrl: s.imageUrl ?? null,
    displayOrder: s.displayOrder ?? 0,
    isActive: s.isActive,
    createdAt: s._creationTime ? new Date(s._creationTime).toISOString() : NOW(),
    updatedAt: NOW(),
  };
}

export class AdminCategoryConvexRepository {
  // ── Image Upload — still uses file API (Cloudinary) ─────────────────────────

  async uploadImage(file: File): Promise<string> {
    const fd = new FormData();
    fd.append('files', file);
    const res = await apiClient.postFormData<ApiResponse>(ENDPOINTS.files.upload('categories'), fd);
    const urls = (res.listData ?? []) as string[];
    return urls[0] ?? '';
  }

  // ── Categories ───────────────────────────────────────────────────────────────

  async create(payload: CategoryPayload): Promise<CategoryDto> {
    const res = await convex.mutation(api.categories.mutations.createCategory, {
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      imageUrl: payload.imageUrl,
      displayOrder: payload.displayOrder,
      isActive: payload.isActive,
    });
    // Fetch via listCategories and find by slug
    const list = await convex.query(api.categories.queries.listCategories, {
      activeOnly: false,
      includeSubcategories: false,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const found = list.items.find((c: any) => c._id === (res as any).id || c.slug === payload.slug);
    if (!found) throw new Error('Category not found after creation');
    return mapCategory(found);
  }

  async update(id: number, payload: Partial<CategoryPayload>): Promise<CategoryDto> {
    await convex.mutation(api.categories.mutations.updateCategory, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      id: fromId(id) as any,
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      imageUrl: payload.imageUrl,
      displayOrder: payload.displayOrder,
      isActive: payload.isActive,
    });
    const list = await convex.query(api.categories.queries.listCategories, {
      activeOnly: false,
      includeSubcategories: false,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const found = list.items.find((c: any) => c._id === fromId(id));
    if (!found) throw new Error('Category not found after update');
    return mapCategory(found);
  }

  async delete(id: number): Promise<void> {
    await convex.mutation(api.categories.mutations.deleteCategory, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      id: fromId(id) as any,
    });
  }

  // ── Subcategories ─────────────────────────────────────────────────────────────

  async createSubcategory(categoryId: number, payload: SubcategoryPayload): Promise<SubcategoryDto> {
    const res = await convex.mutation(api.categories.mutations.createSubcategory, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      categoryId: fromId(categoryId) as any,
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      imageUrl: payload.imageUrl,
      displayOrder: payload.displayOrder,
      isActive: payload.isActive,
    });
    // Return minimal shape — caller re-fetches the full category list
    const shape: SubcategoryDto = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      id: asId((res as any).id),
      categoryId,
      name: payload.name,
      slug: payload.slug,
      description: payload.description ?? null,
      imageUrl: payload.imageUrl ?? null,
      displayOrder: payload.displayOrder ?? 0,
      isActive: payload.isActive ?? true,
      createdAt: NOW(),
      updatedAt: NOW(),
    };
    return shape;
  }

  async updateSubcategory(subId: number, payload: Partial<SubcategoryPayload>): Promise<SubcategoryDto> {
    await convex.mutation(api.categories.mutations.updateSubcategory, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      id: fromId(subId) as any,
      name: payload.name,
      slug: payload.slug,
      description: payload.description,
      imageUrl: payload.imageUrl,
      displayOrder: payload.displayOrder,
      isActive: payload.isActive,
    });
    return {
      id: subId, categoryId: 0, name: payload.name ?? '', slug: payload.slug ?? '',
      description: payload.description ?? null, imageUrl: payload.imageUrl ?? null,
      displayOrder: payload.displayOrder ?? 0, isActive: payload.isActive ?? true,
      createdAt: NOW(), updatedAt: NOW(),
    };
  }

  async deleteSubcategory(subId: number): Promise<void> {
    await convex.mutation(api.categories.mutations.deleteSubcategory, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      id: fromId(subId) as any,
    });
  }
}
