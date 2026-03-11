import { Metadata } from 'next';
import AdminSettingsView from '@/presentation/admin/AdminSettingsView';

export const metadata: Metadata = {
  title: 'Settings — Admin',
};

export default function AdminSettingsPage() {
  return <AdminSettingsView />;
}
