import { apiClient } from './apiClient';
import { ENDPOINTS } from './endpoints';
import type { PromoValidationDto, ValidatePromoResponse } from '@/shared/types/api.types';

export class PromoApiRepository {
  async validate(promoCode: string, orderValue: number): Promise<PromoValidationDto> {
    const res = await apiClient.post<ValidatePromoResponse>(ENDPOINTS.promos.validate, {
      promoCode,
      orderValue,
    });
    return res.data;
  }
}
