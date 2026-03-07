import type { CategoryWithSubcategoriesDto, SubcategoryDto } from '@/shared/types/api.types';
import type { Category, Subcategory } from '@/domain/category/category.entity';

export function mapSubcategory(dto: SubcategoryDto): Subcategory {
  return {
    id:           dto.id,
    categoryId:   dto.categoryId,
    name:         dto.name,
    slug:         dto.slug,
    description:  dto.description,
    imageUrl:     dto.imageUrl,
    displayOrder: dto.displayOrder,
    isActive:     dto.isActive,
  };
}

export function mapCategory(dto: CategoryWithSubcategoriesDto): Category {
  return {
    id:             dto.id,
    name:           dto.name,
    slug:           dto.slug,
    description:    dto.description,
    imageUrl:       dto.imageUrl,
    displayOrder:   dto.displayOrder,
    isActive:       dto.isActive,
    subcategories:  (dto.subcategories ?? []).map(mapSubcategory),
  };
}
