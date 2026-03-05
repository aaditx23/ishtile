'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ProfileFormFields from './components/ProfileFormFields';
import type { User } from '@/domain/user/user.entity';
import type { UpdateUserPayload } from '@/domain/user/user.repository';

interface MobileProfileViewProps {
  user:     User | null;
  loading:  boolean;
  saving:   boolean;
  form:     UpdateUserPayload;
  patch:    (key: keyof UpdateUserPayload) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const navLinks = [
  { label: 'Orders',     href: '/orders' },
  { label: 'Favourites', href: '/favourites' },
];

export default function MobileProfileView({
  user,
  loading,
  saving,
  form,
  patch,
  onSubmit,
}: MobileProfileViewProps) {
  return (
    <div style={{ padding: '1.25rem 1rem' }}>

      {/* Page title */}
      <h1 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
        My Profile
      </h1>

      {/* Quick nav links */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {navLinks.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="flex-1">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>

      {/* Profile form card */}
      <div
        style={{
          border:          '1px solid var(--border)',
          borderRadius:    '0.75rem',
          padding:         '1.25rem',
          backgroundColor: 'var(--surface)',
        }}
      >
        <ProfileFormFields
          user={user}
          loading={loading}
          saving={saving}
          form={form}
          patch={patch}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
}
