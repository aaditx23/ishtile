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
  onPasswordReset: () => void;
  sendingReset: boolean;
}

export default function MobileProfileView({
  user,
  loading,
  saving,
  form,
  patch,
  onSubmit,
  onPasswordReset,
  sendingReset,
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
        <h2 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>Change Password</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-muted)', marginBottom: '0.75rem' }}>
          We’ll email you a secure reset link.
        </p>
        <button
          type="button"
          onClick={onPasswordReset}
          disabled={sendingReset}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.5rem 1.25rem',
            backgroundColor: 'var(--primary)',
            color: 'var(--on-primary)',
            border: 'none',
            cursor: sendingReset ? 'not-allowed' : 'pointer',
            opacity: sendingReset ? 0.7 : 1,
            fontSize: '0.8rem',
            fontWeight: 700,
            width: '100%',
            justifyContent: 'center',
          }}
        >
          {sendingReset ? 'Sending…' : 'Send Reset Link'}
        </button>
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
