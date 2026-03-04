import type { Metadata } from 'next';
import DashboardView from '@/presentation/admin/DashboardView';

export const metadata: Metadata = { title: 'Dashboard — Admin' };

export default function AdminPage() {
  return <DashboardView />;
}
