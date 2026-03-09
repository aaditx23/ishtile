import { convex } from './convexClient';
import { asId } from './convexHelpers';
import { api } from '../../../convex/_generated/api';
import type {
  DashboardStatsDto,
  DailySalesDto,
  ProductSalesDto,
  PromoSalesDto,
} from '@/shared/types/api.types';

export class AnalyticsConvexRepository {
  async getDashboardStats(): Promise<DashboardStatsDto> {
    const res = await convex.query(api.analytics.queries.getDashboardStats, {});
    return {
      todayOrders:      res.todayOrders,
      todayRevenue:     res.todayRevenue,
      pendingOrders:    res.statusCounts?.new ?? 0,
      lowStockVariants: res.lowStockCount,
      totalCustomers:   res.totalUsers,
      activePromos:     0, // not tracked in summary — fetch separately if needed
    };
  }

  async getDailySales(startDate: string, endDate: string): Promise<DailySalesDto[]> {
    const res = await convex.query(api.analytics.queries.getDailySales, {
      startDate,
      endDate,
      pageSize: 90,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return res.items.map((r: any): DailySalesDto => ({
      summaryDate:      r.summaryDate,
      totalOrders:      r.totalOrders,
      totalRevenue:     r.totalRevenue,
      totalDiscount:    r.totalDiscount,
      totalShipping:    r.totalShipping,
      newOrders:        r.newOrders,
      confirmedOrders:  r.confirmedOrders,
      shippedOrders:    r.shippedOrders,
      deliveredOrders:  r.deliveredOrders,
      cancelledOrders:  r.cancelledOrders,
      uniqueCustomers:  r.uniqueCustomers,
      newCustomers:     r.newCustomers,
    }));
  }

  async getProductSales(limit = 10): Promise<ProductSalesDto[]> {
    const res = await convex.query(api.analytics.queries.getProductSales, {
      pageSize: limit,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return res.items.map((r: any): ProductSalesDto => ({
      productId:         asId(r.productId),
      variantId:         r.variantId ? asId(r.variantId) : null,
      productName:       r.productName ?? '',
      variantSize:       r.variantSize ?? null,
      totalQuantitySold: r.totalQuantitySold,
      totalRevenue:      r.totalRevenue,
      totalOrders:       r.totalOrders,
    }));
  }

  async getPromoSales(limit = 20): Promise<PromoSalesDto[]> {
    const res = await convex.query(api.analytics.queries.getPromoSummary, {
      pageSize: limit,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return res.items.map((r: any): PromoSalesDto => ({
      promoId:               asId(r.promoId),
      promoCode:             r.promoCode ?? '',
      totalUses:             r.totalUses,
      totalDiscountGiven:    r.totalDiscountGiven,
      totalRevenueGenerated: r.totalRevenueGenerated,
      uniqueUsers:           r.uniqueUsers,
    }));
  }
}
