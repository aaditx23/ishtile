'use client';

import AdminMobileNavStrip from './components/AdminMobileNavStrip';
import { Input } from '@/components/ui/input';

interface MobileAdminSettingsViewProps {
  formData: {
    insideDhakaShippingCost: number;
    outsideDhakaShippingCost: number;
  };
  loading: boolean;
  saving: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: <K extends keyof MobileAdminSettingsViewProps['formData']>(
    key: K,
    value: MobileAdminSettingsViewProps['formData'][K]
  ) => void;
}

const primaryBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '0.5rem 1rem',
  borderRadius: '0.5rem',
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
  loading,
  saving,
  onSubmit,
  onChange,
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
        <div
          style={{
            border: '1px solid var(--border)',
            borderRadius: '0.625rem',
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

            <button type="submit" disabled={saving} style={primaryBtn}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
