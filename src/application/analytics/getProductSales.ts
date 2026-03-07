import { analyticsRepository } from '@/lib/di';
import type { ProductSalesDto } from '@/shared/types/api.types';

export async function getProductSales(limit = 10): Promise<ProductSalesDto[]> {
  return analyticsRepository.getProductSales(limit);
}
