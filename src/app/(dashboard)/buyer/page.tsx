import type { Metadata } from 'next';
import ProfileView from '@/presentation/buyer/ProfileView';

export const metadata: Metadata = { title: 'My Profile — Ishtyle' };

export default function BuyerPage() {
  return <ProfileView />;
}
