import { convex } from './convexClient';
import { asId, buildPagination } from './convexHelpers';
import { api } from '../../../convex/_generated/api';
import type { CategoryRepository, ListCategoriesParams } from '@/domain/category/category.repository';
import type { Category, Subcategory } from '@/domain/category/category.entity';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSubcategory(s: any): Subcategory {
  return {
    id:           asId(s._id),
    categoryId:   asId(s.categoryId),
    name:         s.name,
    slug:         s.slug,
    description:  s.description ?? null,
    imageUrl:     s.imageUrl ?? null,
    displayOrder: s.displayOrder,
    isActive:     s.isActive,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCategory(c: any): Category {
  return {
    id:            asId(c._id),
    name:          c.name,
    slug:          c.slug,
    description:   c.description ?? null,
    imageUrl:      c.imageUrl ?? null,
    displayOrder:  c.displayOrder,
    isActive:      c.isActive,
    subcategories: (c.subcategories ?? []).map(mapSubcategory),
  };
}

export class CategoryConvexRepository implements CategoryRepository {
  async list(params?: ListCategoriesParams): Promise<Category[]> {
    const res = await convex.query(api.categories.queries.listCategories, {
      page:                 params?.page ?? 1,
      pageSize:             params?.pageSize ?? 100,
      activeOnly:           params?.activeOnly ?? true,
      includeSubcategories: params?.includeSubcategories ?? true,
    });
    return res.items.map(mapCategory);
  }
}
