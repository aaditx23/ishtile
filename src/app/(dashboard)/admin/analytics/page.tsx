import type { Metadata } from 'next';
import { getDailySales } from '@/application/analytics/getDailySales';
import { getProductSales } from '@/application/analytics/getProductSales';
import { getPromoSales } from '@/application/analytics/getPromoSales';
import AnalyticsView from '@/presentation/admin/AnalyticsView';

export const metadata: Metadata = { title: 'Analytics — Admin' };
export const revalidate = 3600;

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function AdminAnalyticsPage() {
  const endDate   = toDateStr(new Date());
  const startDate = toDateStr(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

  const [dailySales, productSales, promoSales] = await Promise.all([
    getDailySales(startDate, endDate),
    getProductSales(10),
    getPromoSales(10),
  ]);

  return <AnalyticsView dailySales={dailySales} productSales={productSales} promoSales={promoSales} />;
}
