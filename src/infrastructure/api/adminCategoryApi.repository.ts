import { apiClient } from './apiClient';
import { ENDPOINTS } from './endpoints';
import type { ApiResponse } from '@/shared/types/api.types';
import type {
    CategoryDto,
    SubcategoryDto,
    CreateCategoryResponse,
    UpdateCategoryResponse,
    DeleteCategoryResponse,
    CreateSubcategoryResponse,
    UpdateSubcategoryResponse,
    DeleteSubcategoryResponse,
} from '@/shared/types/api.types';

export interface CategoryPayload {
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    displayOrder?: number;
    isActive?: boolean;
}

export interface SubcategoryPayload {
    name: string;
    slug: string;
    description?: string;
    imageUrl?: string;
    displayOrder?: number;
    isActive?: boolean;
}

export class AdminCategoryApiRepository {
    async uploadImage(file: File): Promise<string> {
        const fd = new FormData();
        fd.append('files', file);
        const res = await apiClient.postFormData<ApiResponse>(ENDPOINTS.files.upload('categories'), fd);
        const urls = (res.listData ?? []) as string[];
        return urls[0] ?? '';
    }

    async create(payload: CategoryPayload): Promise<CategoryDto> {
        const res = await apiClient.post<CreateCategoryResponse>(
            ENDPOINTS.categories.create,
            payload,
        );
        return res.data;
    }

    async update(id: number, payload: Partial<CategoryPayload>): Promise<CategoryDto> {
        const res = await apiClient.put<UpdateCategoryResponse>(
            ENDPOINTS.categories.update(id),
            payload,
        );
        return res.data;
    }

    async delete(id: number): Promise<void> {
        await apiClient.delete<DeleteCategoryResponse>(ENDPOINTS.categories.delete(id));
    }

    async createSubcategory(categoryId: number, payload: SubcategoryPayload): Promise<SubcategoryDto> {
        const res = await apiClient.post<CreateSubcategoryResponse>(
            ENDPOINTS.categories.subcategories(categoryId),
            { ...payload, categoryId },
        );
        return res.data;
    }

    async updateSubcategory(subId: number, payload: Partial<SubcategoryPayload>): Promise<SubcategoryDto> {
        const res = await apiClient.put<UpdateSubcategoryResponse>(
            ENDPOINTS.categories.subcategory(subId),
            payload,
        );
        return res.data;
    }

    async deleteSubcategory(subId: number): Promise<void> {
        await apiClient.delete<DeleteSubcategoryResponse>(ENDPOINTS.categories.subcategory(subId));
    }
}
