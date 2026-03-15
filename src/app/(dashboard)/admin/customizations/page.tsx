import type { Metadata } from 'next';
import AdminCustomizationsView from '@/presentation/admin/AdminCustomizationsView';

export const metadata: Metadata = { title: 'Customizations — Admin' };

export default function AdminCustomizationsPage() {
  return <AdminCustomizationsView />;
}
