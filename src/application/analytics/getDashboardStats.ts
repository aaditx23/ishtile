import { analyticsRepository } from '@/lib/di';
import type { DashboardStatsDto } from '@/shared/types/api.types';

export async function getDashboardStats(): Promise<DashboardStatsDto> {
  return analyticsRepository.getDashboardStats();
}
