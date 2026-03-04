import { apiClient } from './apiClient';
import { ENDPOINTS } from './endpoints';
import type {
  DashboardStatsDto,
  DailySalesDto,
  ProductSalesDto,
  PromoSalesDto,
  DataResponse,
  PaginatedResponse,
} from '@/shared/types/api.types';

export class AnalyticsApiRepository {
  async getDashboardStats(): Promise<DashboardStatsDto> {
    const res = await apiClient.get<DataResponse<DashboardStatsDto>>(
      ENDPOINTS.admin.analytics.dashboard,
    );
    return res.data;
  }

  async getDailySales(startDate: string, endDate: string): Promise<DailySalesDto[]> {
    const res = await apiClient.get<PaginatedResponse<DailySalesDto>>(
      ENDPOINTS.admin.analytics.dailySales,
      { params: { startDate, endDate, pageSize: 90 } },
    );
    return res.listData;
  }

  async getProductSales(limit = 10): Promise<ProductSalesDto[]> {
    const res = await apiClient.get<PaginatedResponse<ProductSalesDto>>(
      ENDPOINTS.admin.analytics.productSales,
      { params: { pageSize: limit } },
    );
    return res.listData;
  }

  async getPromoSales(limit = 20): Promise<PromoSalesDto[]> {
    const res = await apiClient.get<PaginatedResponse<PromoSalesDto>>(
      ENDPOINTS.admin.analytics.promoSales,
      { params: { pageSize: limit } },
    );
    return res.listData;
  }
}
