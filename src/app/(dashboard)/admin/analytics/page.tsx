import type { Metadata } from 'next';
import AnalyticsView from '@/presentation/admin/AnalyticsView';

export const metadata: Metadata = { title: 'Analytics — Admin' };

export default function AdminAnalyticsPage() {
  return <AnalyticsView />;
}
