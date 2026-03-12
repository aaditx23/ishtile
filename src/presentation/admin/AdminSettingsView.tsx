'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import { AdminSidebarNav } from './AdminLayout';
import MobileAdminSettingsView from './MobileAdminSettingsView';
import { Input } from '@/components/ui/input';
import { getAdminSettings, updateAdminSettings } from '@/application/adminSettings/adminSettings';
import type { AdminSettings } from '@/domain/adminSettings/adminSettings.entity';
import { Button } from '@/components/ui/button';

const primaryBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.375rem',
  padding: '0.5rem 1.25rem',
  backgroundColor: 'var(--primary)',
  color: 'var(--on-primary)',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.8rem',
  fontWeight: 700,
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

export default function AdminSettingsView() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    insideDhakaShippingCost: 60,
    outsideDhakaShippingCost: 120,
  });

  useEffect(() => {
    getAdminSettings()
      .then((data) => {
        setSettings(data);
        setFormData({
          insideDhakaShippingCost: data.insideDhakaShippingCost,
          outsideDhakaShippingCost: data.outsideDhakaShippingCost,
        });
      })
      .catch(() => toast.error('Failed to load settings.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateAdminSettings(formData);
      setSettings(updated);
      toast.success('Settings updated successfully.');
    } catch {
      toast.error('Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  const set = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <ShopLayout>
      {/* ── Mobile ─────────────────────────────────────────────────────────── */}
      <div className="block lg:hidden">
        <MobileAdminSettingsView
          formData={formData}
          loading={loading}
          saving={saving}
          onSubmit={handleSubmit}
          onChange={set}
        />
      </div>

      {/* ── Desktop ─────────────────────────────────────────────────────────── */}
      <div
        className="hidden lg:grid"
        style={{
          maxWidth: '84rem',
          margin: '0 auto',
          padding: '2rem 1.25rem',
          gridTemplateColumns: '13rem 1fr',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        <AdminSidebarNav activeHref="/admin/settings" />

        <main>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Settings</h1>

            {loading ? (
              <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.875rem' }}>Loading...</p>
            ) : (
              <div
                style={{
                  border: '1px solid var(--border)',
                  padding: '1.5rem',
                  backgroundColor: 'var(--surface)',
                }}
              >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Shipping Costs</h2>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <div>
                      <label style={labelStyle}>Inside Dhaka (৳)</label>
                      <Input
                        type="number"
                        value={formData.insideDhakaShippingCost}
                        onChange={(e) => set('insideDhakaShippingCost', Number(e.target.value))}
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
                        onChange={(e) => set('outsideDhakaShippingCost', Number(e.target.value))}
                        required
                        disabled={saving}
                        min={0}
                        step={1}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <Button type="submit" disabled={saving} style={primaryBtn}>
                      {saving ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </ShopLayout>
  );
}
