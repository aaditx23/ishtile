import { apiClient } from './apiClient';
import { ENDPOINTS } from './endpoints';
import { nowUtc } from '@/shared/utils/timezone';
import type { PromoValidationDto, ValidatePromoResponse } from '@/shared/types/api.types';

export class PromoApiRepository {
  async validate(promoCode: string, orderValue: number): Promise<PromoValidationDto> {
    const res = await apiClient.post<ValidatePromoResponse>(ENDPOINTS.promos.validate, {
      promoCode,
      orderValue,
      now: nowUtc(), // current UTC time derived from Bangladesh local clock
    });
    return res.data;
  }
}
