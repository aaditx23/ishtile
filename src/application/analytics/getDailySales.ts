import { analyticsRepository } from '@/lib/di';
import type { DailySalesDto } from '@/shared/types/api.types';

export async function getDailySales(startDate: string, endDate: string): Promise<DailySalesDto[]> {
  return analyticsRepository.getDailySales(startDate, endDate);
}
