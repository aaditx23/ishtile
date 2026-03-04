import type { Metadata } from 'next';
import { Suspense } from 'react';
import AdminProductsView from '@/presentation/admin/AdminProductsView';

export const metadata: Metadata = { title: 'Products — Admin' };

export default function AdminProductsPage() {
  return <Suspense><AdminProductsView /></Suspense>;
}
