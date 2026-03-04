import type { Metadata } from 'next';
import { getDashboardStats } from '@/application/analytics/getDashboardStats';
import DashboardView from '@/presentation/admin/DashboardView';

export const metadata: Metadata = { title: 'Dashboard — Admin' };
export const revalidate = 60;

export default async function AdminPage() {
  const stats = await getDashboardStats();
  return <DashboardView stats={stats} />;
}
