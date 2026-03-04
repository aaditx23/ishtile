import { adminCategoryRepository, categoryRepository } from '@/lib/di';
import type { Category } from '@/domain/category/category.entity';
import type { CategoryDto, SubcategoryDto } from '@/shared/types/api.types';
import type { CategoryPayload, SubcategoryPayload } from '@/infrastructure/api/adminCategoryApi.repository';

export async function getCategories(): Promise<Category[]> {
    return categoryRepository.list({ activeOnly: false, includeSubcategories: true });
}

export async function createCategory(payload: CategoryPayload): Promise<CategoryDto> {
    return adminCategoryRepository.create(payload);
}

export async function updateCategory(id: number, payload: Partial<CategoryPayload>): Promise<CategoryDto> {
    return adminCategoryRepository.update(id, payload);
}

export async function deleteCategory(id: number): Promise<void> {
    return adminCategoryRepository.delete(id);
}

export async function createSubcategory(categoryId: number, payload: SubcategoryPayload): Promise<SubcategoryDto> {
    return adminCategoryRepository.createSubcategory(categoryId, payload);
}

export async function updateSubcategory(subId: number, payload: Partial<SubcategoryPayload>): Promise<SubcategoryDto> {
    return adminCategoryRepository.updateSubcategory(subId, payload);
}

export async function deleteSubcategory(subId: number): Promise<void> {
    return adminCategoryRepository.deleteSubcategory(subId);
}
