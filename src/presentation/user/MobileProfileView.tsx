'use client';

import UserMobileNavStrip from './components/UserMobileNavStrip';
import ProfileFormFields from './components/ProfileFormFields';
import AddressManager from './components/AddressManager';
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

      <UserMobileNavStrip activeHref="/profile" />

      {/* Profile form card */}
      <div
        style={{
          border:          '1px solid var(--border)',
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

      <div
        style={{
          border:          '1px solid var(--border)',
          padding:         '1.25rem',
          backgroundColor: 'var(--surface)',
          marginTop:       '1.25rem',
        }}
      >
        <AddressManager user={user} />
      </div>
    </div>
  );
}
