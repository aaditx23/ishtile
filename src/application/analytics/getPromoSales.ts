import { analyticsRepository } from '@/lib/di';
import type { PromoSalesDto } from '@/shared/types/api.types';

export async function getPromoSales(limit = 20): Promise<PromoSalesDto[]> {
  return analyticsRepository.getPromoSales(limit);
}
