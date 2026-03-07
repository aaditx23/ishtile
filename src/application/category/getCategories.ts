import { categoryRepository } from '@/lib/di';
import type { Category } from '@/domain/category/category.entity';
import type { ListCategoriesParams } from '@/domain/category/category.repository';

export async function getCategories(params?: ListCategoriesParams): Promise<Category[]> {
  return categoryRepository.list(params);
}
