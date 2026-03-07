import { apiClient } from './apiClient';
import { ENDPOINTS } from './endpoints';
import type { PromoDto, DataResponse, PaginatedResponse, ActionResponse } from '@/shared/types/api.types';
import type { CreatePromoPayload, UpdatePromoPayload } from '@/domain/promo/promo.entity';

export interface PaginatedPromos {
  items:      PromoDto[];
  pagination: { total: number; page: number; pageSize: number; totalPages: number; hasNext: boolean; hasPrev: boolean };
}

export class AdminPromoApiRepository {
  async list(page = 1, pageSize = 20): Promise<PaginatedPromos> {
    const res = await apiClient.get<PaginatedResponse<PromoDto>>(
      ENDPOINTS.admin.promos.list,
      { params: { page, pageSize } },
    );
    return { items: res.listData, pagination: res.data.pagination };
  }

  async create(payload: CreatePromoPayload): Promise<PromoDto> {
    const res = await apiClient.post<DataResponse<PromoDto>>(
      ENDPOINTS.admin.promos.list,
      payload,
    );
    return res.data;
  }

  async update(id: number, payload: UpdatePromoPayload): Promise<PromoDto> {
    const res = await apiClient.put<DataResponse<PromoDto>>(
      ENDPOINTS.admin.promos.detail(id),
      payload,
    );
    return res.data;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete<ActionResponse>(ENDPOINTS.admin.promos.detail(id));
  }
}
