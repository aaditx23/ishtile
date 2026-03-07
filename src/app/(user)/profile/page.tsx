import type { Metadata } from 'next';
import ProfileView from '@/presentation/user/ProfileView';

export const metadata: Metadata = { title: 'My Profile — Ishtile' };

export default function ProfilePage() {
  return <ProfileView />;
}
