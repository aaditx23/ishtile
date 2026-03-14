'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import MobileProfileView from './MobileProfileView';
import ProfileFormFields from './components/ProfileFormFields';
import AddressManager from './components/AddressManager';
import { getProfile } from '@/application/user/getProfile';
import { updateProfile } from '@/application/user/updateProfile';
import type { User } from '@/domain/user/user.entity';
import type { UpdateUserPayload } from '@/domain/user/user.repository';

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
        fullName: u.fullName ?? '',
        username: u.username ?? '',
        email:    u.email ?? '',
        phone:    u.phone ?? '',
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

    const username = form.username?.trim();
    if (username && username.length > 10) {
      toast.error('Username must be within 10 characters.');
      return;
    }

    setSaving(true);
    try {
      const updated = await updateProfile({
        ...form,
        username,
      });
      setUser(updated);
      toast.success('Profile updated.');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save profile.';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const [sendingReset, setSendingReset] = useState(false);
  const handlePasswordReset = async () => {
    if (!user?.email) {
      toast.error('Please add an email address to your profile first.');
      return;
    }
    setSendingReset(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, redirectTo: 'profile' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message ?? 'Failed to send reset email.');
      } else {
        toast.success('Reset link sent. Check your email.');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSendingReset(false);
    }
  };

  const formProps = { user, loading, saving, form, patch, onSubmit: handleSubmit };

  return (
    <ShopLayout>
      {/* Mobile: full-width vertical layout */}
      <div className="block lg:hidden">
        <MobileProfileView
          {...formProps}
          onPasswordReset={handlePasswordReset}
          sendingReset={sendingReset}
        />
      </div>

      {/* Desktop: centered card */}
      <div className="hidden lg:block">
        <div style={{ maxWidth: '52rem', margin: '0 auto', padding: '2rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            style={{
              border:          '1px solid var(--border)',
              padding:         '1.5rem',
              backgroundColor: 'var(--surface)',
            }}
          >
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>My Profile</h1>
            <ProfileFormFields {...formProps} />
          </div>

          <div
            style={{
              border:          '1px solid var(--border)',
              padding:         '1.5rem',
              backgroundColor: 'var(--surface)',
            }}
          >
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Change Password</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--on-surface-muted)', marginBottom: '1rem' }}>
              We’ll email you a secure link to reset your password.
            </p>
            <button
              type="button"
              onClick={handlePasswordReset}
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
              }}
            >
              {sendingReset ? 'Sending…' : 'Send Reset Link'}
            </button>
          </div>

          <div
            style={{
              border:          '1px solid var(--border)',
              padding:         '1.5rem',
              backgroundColor: 'var(--surface)',
            }}
          >
            <AddressManager user={user} />
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}
