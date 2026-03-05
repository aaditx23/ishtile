'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { UpdateUserPayload } from '@/domain/user/user.repository';
import type { User } from '@/domain/user/user.entity';

const labelStyle: React.CSSProperties = {
  display:       'block',
  fontSize:      '0.7rem',
  fontWeight:    600,
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color:         'var(--on-surface-muted)',
  marginBottom:  '0.3rem',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

interface ProfileFormFieldsProps {
  user:    User | null;
  loading: boolean;
  saving:  boolean;
  form:    UpdateUserPayload;
  patch:   (key: keyof UpdateUserPayload) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ProfileFormFields({
  user,
  loading,
  saving,
  form,
  patch,
  onSubmit,
}: ProfileFormFieldsProps) {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} style={{ height: '2.5rem', borderRadius: '0.5rem' }} />
        ))}
      </div>
    );
  }

  if (!user) return null;

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Read-only info */}
      <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'var(--surface-muted)', fontSize: '0.875rem' }}>
        <span style={{ color: 'var(--on-surface-muted)' }}>Phone: </span>
        <strong>{user.phone}</strong>
        {user.role === 'admin' && (
          <span style={{ marginLeft: '1rem', fontSize: '0.75rem', color: 'var(--brand-gold)', fontWeight: 700 }}>ADMIN</span>
        )}
      </div>

      <Field label="Full Name">
        <Input value={form.fullName ?? ''} onChange={patch('fullName')} placeholder="Your name" disabled={saving} />
      </Field>

      <Field label="Email">
        <Input type="email" value={form.email ?? ''} onChange={patch('email')} placeholder="your@email.com" disabled={saving} />
      </Field>

      <Field label="Address">
        <Input value={form.addressLine ?? ''} onChange={patch('addressLine')} placeholder="House / road / area" disabled={saving} />
      </Field>

      <Field label="City">
        <Input value={form.city ?? ''} onChange={patch('city')} placeholder="Dhaka" disabled={saving} />
      </Field>

      <Field label="Postal Code">
        <Input value={form.postalCode ?? ''} onChange={patch('postalCode')} placeholder="1205" disabled={saving} />
      </Field>

      <Button type="submit" disabled={saving} className="w-full">
        {saving ? 'Saving…' : 'Save Changes'}
      </Button>
    </form>
  );
}
