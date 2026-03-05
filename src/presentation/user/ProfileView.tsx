'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import MobileProfileView from './MobileProfileView';
import ProfileFormFields from './components/ProfileFormFields';
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

  const formProps = { user, loading, saving, form, patch, onSubmit: handleSubmit };

  return (
    <ShopLayout>
      {/* Mobile: full-width vertical layout */}
      <div className="block lg:hidden">
        <MobileProfileView {...formProps} />
      </div>

      {/* Desktop: centered card */}
      <div className="hidden lg:block">
        <div style={{ maxWidth: '52rem', margin: '0 auto', padding: '2rem 1.25rem' }}>
          <div
            style={{
              border:          '1px solid var(--border)',
              borderRadius:    '0.75rem',
              padding:         '1.5rem',
              backgroundColor: 'var(--surface)',
            }}
          >
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>My Profile</h1>
            <ProfileFormFields {...formProps} />
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}
