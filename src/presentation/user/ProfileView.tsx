'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import UserLayout from './UserLayout';
import { getProfile } from '@/application/user/getProfile';
import { updateProfile } from '@/application/user/updateProfile';
import type { User } from '@/domain/user/user.entity';
import type { UpdateUserPayload } from '@/domain/user/user.repository';

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

export default function ProfileView() {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [form, setForm]       = useState<UpdateUserPayload>({});
  const initRef               = useRef(false);

  const fetchProfile = useCallback(async () => {
    try {
      const u = await getProfile();
      setUser(u);
      setForm({
        fullName:    u.fullName    ?? '',
        email:       u.email       ?? '',
        addressLine: u.addressLine ?? '',
        city:        u.city        ?? '',
        postalCode:  u.postalCode  ?? '',
      });
    } catch {
      toast.error('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    fetchProfile();
  }, [fetchProfile]);

  const patch = (key: keyof UpdateUserPayload) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfile(form);
      setUser(updated);
      toast.success('Profile updated.');
    } catch {
      toast.error('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <UserLayout activeHref="/profile">
      <div
        style={{
          border:          '1px solid var(--border)',
          borderRadius:    '0.75rem',
          padding:         '1.5rem',
          backgroundColor: 'var(--surface)',
        }}
      >
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>My Profile</h1>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1,2,3,4].map((i) => <Skeleton key={i} style={{ height: '2.5rem', borderRadius: '0.5rem' }} />)}
          </div>
        ) : user ? (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Read-only info */}
            <div style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'var(--surface-muted)', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--on-surface-muted)' }}>Phone: </span>
              <strong>{user.phone}</strong>
              {user.role === 'admin' && (
                <span style={{ marginLeft: '1rem', fontSize: '0.75rem', color: 'var(--brand-gold)', fontWeight: 700 }}>ADMIN</span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="Full Name">
                <Input value={form.fullName ?? ''} onChange={patch('fullName')} placeholder="Your name" disabled={saving} />
              </Field>
              <Field label="Email">
                <Input type="email" value={form.email ?? ''} onChange={patch('email')} placeholder="your@email.com" disabled={saving} />
              </Field>
            </div>

            <Field label="Address">
              <Input value={form.addressLine ?? ''} onChange={patch('addressLine')} placeholder="House / road / area" disabled={saving} />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="City">
                <Input value={form.city ?? ''} onChange={patch('city')} placeholder="Dhaka" disabled={saving} />
              </Field>
              <Field label="Postal Code">
                <Input value={form.postalCode ?? ''} onChange={patch('postalCode')} placeholder="1205" disabled={saving} />
              </Field>
            </div>

            <Button
              type="submit"
              disabled={saving}
              style={{ alignSelf: 'flex-start', backgroundColor: 'var(--brand-dark)', color: 'var(--on-primary)', minWidth: '9rem' }}
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </form>
        ) : null}
      </div>
    </UserLayout>
  );
}
