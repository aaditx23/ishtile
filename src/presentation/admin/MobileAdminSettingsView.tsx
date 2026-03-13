'use client';

import { Button } from '@/components/ui/button';
import AdminMobileNavStrip from './components/AdminMobileNavStrip';
import { Input } from '@/components/ui/input';

interface MobileAdminSettingsViewProps {
  formData: {
    insideDhakaShippingCost: number;
    outsideDhakaShippingCost: number;
  };
  adminForm: {
    phone: string;
    email: string;
    username: string;
    fullName: string;
    password: string;
  };
  loading: boolean;
  saving: boolean;
  creatingAdmin: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: <K extends keyof MobileAdminSettingsViewProps['formData']>(
    key: K,
    value: MobileAdminSettingsViewProps['formData'][K]
  ) => void;
  onAdminChange: <K extends keyof MobileAdminSettingsViewProps['adminForm']>(
    key: K,
    value: MobileAdminSettingsViewProps['adminForm'][K]
  ) => void;
  onCreateAdmin: (e: React.FormEvent) => void;
}

const primaryBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.5rem 1rem',
  backgroundColor: 'var(--primary)',
  color: 'var(--on-primary)',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.8rem',
  fontWeight: 700,
  width: '100%',
  justifyContent: 'center',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--on-surface-muted)',
  marginBottom: '0.375rem',
  display: 'block',
};

export default function MobileAdminSettingsView({
  formData,
  adminForm,
  loading,
  saving,
  creatingAdmin,
  onSubmit,
  onChange,
  onAdminChange,
  onCreateAdmin,
}: MobileAdminSettingsViewProps) {
  return (
    <div style={{ padding: '1.25rem 1rem' }}>
      <AdminMobileNavStrip activeHref="/admin/settings" />

      <h1 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>Settings</h1>

      {loading ? (
        <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.875rem', padding: '2rem', textAlign: 'center' }}>
          Loading...
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              border: '1px solid var(--border)',
              padding: '1rem',
              backgroundColor: 'var(--surface)',
            }}
          >
            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.25rem' }}>Shipping Costs</h2>

              <div>
                <label style={labelStyle}>Inside Dhaka (৳)</label>
                <Input
                  type="number"
                  value={formData.insideDhakaShippingCost}
                  onChange={(e) => onChange('insideDhakaShippingCost', Number(e.target.value))}
                  required
                  disabled={saving}
                  min={0}
                  step={1}
                />
              </div>

              <div>
                <label style={labelStyle}>Outside Dhaka (৳)</label>
                <Input
                  type="number"
                  value={formData.outsideDhakaShippingCost}
                  onChange={(e) => onChange('outsideDhakaShippingCost', Number(e.target.value))}
                  required
                  disabled={saving}
                  min={0}
                  step={1}
                />
              </div>

              <Button type="submit" disabled={saving} style={primaryBtn}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </form>
          </div>

          <div
            style={{
              border: '1px solid var(--border)',
              padding: '1rem',
              backgroundColor: 'var(--surface)',
            }}
          >
            <form onSubmit={onCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.25rem' }}>Create Admin</h2>

              <div>
                <label style={labelStyle}>Phone Number</label>
                <Input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={adminForm.phone}
                  onChange={(e) => onAdminChange('phone', e.target.value)}
                  disabled={creatingAdmin}
                />
              </div>

              <div>
                <label style={labelStyle}>Email</label>
                <Input
                  type="email"
                  placeholder="admin@example.com"
                  value={adminForm.email}
                  onChange={(e) => onAdminChange('email', e.target.value)}
                  required
                  disabled={creatingAdmin}
                />
              </div>

              <div>
                <label style={labelStyle}>Username</label>
                <Input
                  type="text"
                  placeholder="adminuser"
                  value={adminForm.username}
                  onChange={(e) => onAdminChange('username', e.target.value)}
                  required
                  disabled={creatingAdmin}
                />
              </div>

              <div>
                <label style={labelStyle}>Full Name</label>
                <Input
                  type="text"
                  placeholder="Admin Name"
                  value={adminForm.fullName}
                  onChange={(e) => onAdminChange('fullName', e.target.value)}
                  required
                  disabled={creatingAdmin}
                />
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={adminForm.password}
                  onChange={(e) => onAdminChange('password', e.target.value)}
                  required
                  disabled={creatingAdmin}
                />
              </div>

              <Button type="submit" disabled={creatingAdmin} style={primaryBtn}>
                {creatingAdmin ? 'Creating...' : 'Create Admin'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
