import type { Metadata } from 'next';
import CheckoutView from '@/presentation/checkout/CheckoutView';

export const metadata: Metadata = { title: 'Checkout — Ishtyle' };

export default function CheckoutPage() {
  return <CheckoutView />;
}
