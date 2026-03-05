'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import { AdminSidebarNav } from './AdminLayout';
import MobileAdminPromosView from './MobileAdminPromosView';
import { getPromos, createPromo, updatePromo, deletePromo } from '@/application/promo/adminPromo';
import type { PromoDto, CreatePromoPayload } from '@/domain/promo/promo.entity';

const EMPTY_FORM: CreatePromoPayload = {
  code:         '',
  discountType: 'percentage',
  discountValue: 0,
  isActive:     true,
};

const labelStyle: React.CSSProperties = {
  fontSize:      '0.65rem',
  fontWeight:    700,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color:         'var(--on-surface-muted)',
  marginBottom:  '0.2rem',
  display:       'block',
};

function PromoFormModal({
  initial,
  onSave,
  onClose,
}: {
  initial?:  PromoDto;
  onSave:    (p: PromoDto) => void;
  onClose:   () => void;
}) {
  const [form, setForm] = useState<CreatePromoPayload>(
    initial
      ? {
          code:              initial.code,
          discountType:      initial.discountType,
          discountValue:     initial.discountValue,
          minimumOrderValue: initial.minimumOrderValue ?? undefined,
          maximumDiscount:   initial.maximumDiscount   ?? undefined,
          maxTotalUses:      initial.maxTotalUses       ?? undefined,
          maxUsesPerUser:    initial.maxUsesPerUser     ?? undefined,
          startsAt:          initial.startsAt           ?? undefined,
          expiresAt:         initial.expiresAt          ?? undefined,
          isActive:          initial.isActive,
        }
      : EMPTY_FORM,
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = initial
        ? await updatePromo(initial.id, form)
        : await createPromo(form);
      onSave(result);
      toast.success(initial ? 'Promo updated.' : 'Promo created.');
    } catch {
      toast.error('Failed to save promo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position:        'fixed',
        inset:           0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        zIndex:          1000,
        padding:         '1rem',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius:    '0.75rem',
          padding:         '1.5rem',
          width:           '100%',
          maxWidth:        '32rem',
          maxHeight:       '90vh',
          overflowY:       'auto',
        }}
      >
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
          {initial ? 'Edit Promo' : 'New Promo'}
        </h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-[0.875rem]">
            <div>
              <label style={labelStyle}>Code</label>
              <Input value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} required disabled={saving} />
            </div>
            <div>
              <label style={labelStyle}>Type</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value as 'percentage' | 'flat' }))}
                disabled={saving}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '0.875rem', backgroundColor: 'var(--surface)', color: 'inherit' }}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat (৳)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Discount Value</label>
              <Input type="number" value={form.discountValue} onChange={(e) => setForm((p) => ({ ...p, discountValue: Number(e.target.value) }))} required disabled={saving} />
            </div>
            <div>
              <label style={labelStyle}>Min Order (৳)</label>
              <Input type="number" value={form.minimumOrderValue ?? ''} onChange={(e) => setForm((p) => ({ ...p, minimumOrderValue: e.target.value ? Number(e.target.value) : undefined }))} disabled={saving} />
            </div>
            <div>
              <label style={labelStyle}>Max Discount (৳)</label>
              <Input type="number" value={form.maximumDiscount ?? ''} onChange={(e) => setForm((p) => ({ ...p, maximumDiscount: e.target.value ? Number(e.target.value) : undefined }))} disabled={saving} />
            </div>
            <div>
              <label style={labelStyle}>Max Total Uses</label>
              <Input type="number" value={form.maxTotalUses ?? ''} onChange={(e) => setForm((p) => ({ ...p, maxTotalUses: e.target.value ? Number(e.target.value) : undefined }))} disabled={saving} />
            </div>
            <div>
              <label style={labelStyle}>Max Uses / User</label>
              <Input type="number" value={form.maxUsesPerUser ?? ''} onChange={(e) => setForm((p) => ({ ...p, maxUsesPerUser: e.target.value ? Number(e.target.value) : undefined }))} disabled={saving} />
            </div>
            <div>
              <label style={labelStyle}>Starts At</label>
              <Input type="datetime-local" value={form.startsAt?.slice(0, 16) ?? ''} onChange={(e) => setForm((p) => ({ ...p, startsAt: e.target.value || undefined }))} disabled={saving} />
            </div>
            <div>
              <label style={labelStyle}>Expires At</label>
              <Input type="datetime-local" value={form.expiresAt?.slice(0, 16) ?? ''} onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value || undefined }))} disabled={saving} />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.isActive ?? true} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} disabled={saving} />
            Active
          </label>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPromosView() {
  const [promos, setPromos]       = useState<PromoDto[]>([]);
  const [loading, setLoading]     = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]     = useState<PromoDto | undefined>();
  const initRef                   = useRef(false);

  const fetchPromos = useCallback(async () => {
    try {
      const result = await getPromos(1, 100);
      setPromos(result.items);
    } catch { toast.error('Failed to load promos.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    fetchPromos();
  }, [fetchPromos]);

  const handleSave = (promo: PromoDto) => {
    setPromos((prev) => {
      const idx = prev.findIndex((p) => p.id === promo.id);
      return idx >= 0
        ? prev.map((p) => (p.id === promo.id ? promo : p))
        : [...prev, promo];
    });
    setModalOpen(false);
    setEditing(undefined);
  };

  const handleDelete = async (id: number, code: string) => {
    if (!confirm(`Delete promo "${code}"?`)) return;
    try {
      await deletePromo(id);
      setPromos((prev) => prev.filter((p) => p.id !== id));
      toast.success('Promo deleted.');
    } catch { toast.error('Failed to delete promo.'); }
  };

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' }) : '—';

  const openNew  = () => { setEditing(undefined); setModalOpen(true); };
  const openEdit  = (p: PromoDto) => { setEditing(p); setModalOpen(true); };

  return (
    <ShopLayout>
      {/* ── Mobile ─────────────────────────────────────────────────────── */}
      <div className="block lg:hidden">
        <MobileAdminPromosView
          promos={promos}
          loading={loading}
          onNew={openNew}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* ── Desktop ────────────────────────────────────────────────────── */}
      <div
        className="hidden lg:grid"
        style={{
          maxWidth:            '84rem',
          margin:              '0 auto',
          padding:             '2rem 1.25rem',
          gridTemplateColumns: '13rem 1fr',
          gap:                 '2rem',
          alignItems:          'start',
        }}
      >
        <AdminSidebarNav activeHref="/admin/promos" />

        <main>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Promos</h1>
              <button
                onClick={openNew}
                style={{
                  display:         'inline-flex',
                  alignItems:      'center',
                  gap:             '0.375rem',
                  padding:         '0.5rem 1rem',
                  borderRadius:    '0.5rem',
                  backgroundColor: 'var(--primary)',
                  color:           'var(--on-primary)',
                  border:          'none',
                  fontSize:        '0.8rem',
                  fontWeight:      700,
                  cursor:          'pointer',
                }}
              >
                + New Promo
              </button>
            </div>

            <div style={{ border: '1px solid var(--border)', borderRadius: '0.75rem', overflowX: 'auto', backgroundColor: 'var(--surface)' }}>
              {loading ? (
                <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--on-surface-muted)', fontSize: '0.875rem' }}>Loading…</p>
              ) : promos.length === 0 ? (
                <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--on-surface-muted)', fontSize: '0.875rem' }}>No promos yet.</p>
              ) : (
                <table style={{ width: '100%', minWidth: '42rem', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-muted)' }}>
                      {['Code', 'Type', 'Value', 'Min Order', 'Uses', 'Expires', 'Status', ''].map((h) => (
                        <th key={h} style={{ padding: '0.6rem 0.875rem', textAlign: 'left', fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-muted)', whiteSpace: 'nowrap' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {promos.map((p, i) => (
                      <tr key={p.id} style={{ borderBottom: i < promos.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <td style={{ padding: '0.6rem 0.875rem', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem' }}>{p.code}</td>
                        <td style={{ padding: '0.6rem 0.875rem', textTransform: 'capitalize' }}>{p.discountType}</td>
                        <td style={{ padding: '0.6rem 0.875rem', fontWeight: 700 }}>
                          {p.discountType === 'percentage' ? `${p.discountValue}%` : `৳${p.discountValue}`}
                        </td>
                        <td style={{ padding: '0.6rem 0.875rem' }}>{p.minimumOrderValue ? `৳${p.minimumOrderValue}` : '—'}</td>
                        <td style={{ padding: '0.6rem 0.875rem' }}>
                          {p.currentUses}{p.maxTotalUses ? `/${p.maxTotalUses}` : ''}
                        </td>
                        <td style={{ padding: '0.6rem 0.875rem', whiteSpace: 'nowrap' }}>{fmtDate(p.expiresAt)}</td>
                        <td style={{ padding: '0.6rem 0.875rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px', backgroundColor: p.isActive ? '#d1fae5' : '#fee2e2', color: p.isActive ? '#065f46' : '#991b1b', textTransform: 'uppercase' }}>
                            {p.isActive ? 'Active' : 'Off'}
                          </span>
                        </td>
                        <td style={{ padding: '0.6rem 0.875rem' }}>
                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={() => openEdit(p)} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-gold)', background: 'none', border: 'none', cursor: 'pointer' }}>
                              Edit
                            </button>
                            <button onClick={() => handleDelete(p.id, p.code)} style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--destructive)', background: 'none', border: 'none', cursor: 'pointer' }}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>

      {modalOpen && (
        <PromoFormModal
          initial={editing}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditing(undefined); }}
        />
      )}
    </ShopLayout>
  );
}
