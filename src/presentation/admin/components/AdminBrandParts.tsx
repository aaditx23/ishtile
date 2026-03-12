'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { createBrand, updateBrand, uploadBrandImage } from '@/application/brand/adminBrand';
import type { Brand } from '@/domain/brand/brand.entity';
import { Button } from '@/components/ui/button';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ─── Modal discriminant type ──────────────────────────────────────────────────

export type Modal =
  | { type: 'new' }
  | { type: 'edit'; brand: Brand };

// ─── Style helpers ─────────────────────────────────────────────────────────────

export const labelStyle: React.CSSProperties = {
  fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.1em', color: 'var(--on-surface-muted)',
  marginBottom: '0.2rem', display: 'block',
};

export const primaryBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center',
  padding: '0.5rem 1.25rem',
  backgroundColor: 'var(--primary)', color: 'var(--on-primary)',
  border: 'none', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
};

export const outlineBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center',
  padding: '0.5rem 1.25rem',
  backgroundColor: 'transparent', color: 'var(--on-surface)',
  border: '1px solid var(--border)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
};

export const actionBtn = (color: string): React.CSSProperties => ({
  fontSize: '0.72rem', fontWeight: 600, color, background: 'none',
  border: 'none', cursor: 'pointer', padding: 0,
});

// ─── Small shared UI ──────────────────────────────────────────────────────────

export function Badge({ active }: { active: boolean }) {
  return (
    <span style={{
      fontSize: '0.65rem', fontWeight: 700, padding: '0.15rem 0.5rem',
      textTransform: 'uppercase',
      backgroundColor: active ? '#d1fae5' : '#fee2e2',
      color: active ? '#065f46' : '#991b1b',
    }}>
      {active ? 'Active' : 'Off'}
    </span>
  );
}

export function ActionLinks({
  onEdit, onDelete,
}: {
  onEdit:   React.MouseEventHandler;
  onDelete: React.MouseEventHandler;
}) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem' }}>
      <button onClick={onEdit} style={actionBtn('#A58C69')}>Edit</button>
      <button onClick={onDelete} style={actionBtn('var(--destructive)')}>Delete</button>
    </div>
  );
}

export function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem',
    }}>
      <div style={{
        backgroundColor: 'var(--surface)',
        padding: '1.5rem', width: '100%', maxWidth: '34rem',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {children}
      </div>
    </div>
  );
}

// ─── Brand Row ────────────────────────────────────────────────────────────────

export function BrandRow({
  brand,
  onEdit,
  onDelete,
}: {
  brand:    Brand;
  onEdit:   (b: Brand) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div style={{
      border:          '1px solid var(--border)',
      padding:         '0.75rem 1rem',
      backgroundColor: 'var(--surface)',
    }}>
      {/* Row 1: Image + Name + Status + Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
        {brand.imageUrl && (
        <div style={{ width: '2.5rem', height: '2.5rem', overflow: 'hidden', flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brand.imageUrl} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '0.825rem', fontWeight: 700, margin: 0 }}>{brand.name}</h3>
          <Badge active={brand.isActive} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <ActionLinks
            onEdit={() => onEdit(brand)}
            onDelete={() => onDelete(brand.id)}
          />
        </div>
      </div>

      {/* Row 2: Slug */}
      <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-muted)' }}>
        <span style={{ fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{brand.slug}</span>
      </div>
    </div>
  );
}

// ─── Brand Form Modal ─────────────────────────────────────────────────────────

export function BrandModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: Brand;
  onSave:   (b: Brand) => void;
  onClose:  () => void;
}) {
  const [form, setForm] = useState({
    name:         initial?.name         ?? '',
    slug:         initial?.slug         ?? '',
    description:  initial?.description  ?? '',
    imageUrl:     initial?.imageUrl     ?? '',
    displayOrder: initial?.displayOrder ?? 0,
    isActive:     initial?.isActive     ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name:         form.name.trim(),
        slug:         form.slug.trim() || slugify(form.name),
        description:  form.description.trim() || undefined,
        imageUrl:     form.imageUrl || undefined,
        displayOrder: Number(form.displayOrder),
        isActive:     form.isActive,
      };
      
      if (imageFile) {
        payload.imageUrl = await uploadBrandImage(imageFile);
      }
      
      if (initial) {
        const updated = await updateBrand(initial.id, payload);
        onSave({ ...initial, ...updated });
      } else {
        const created = await createBrand(payload);
        onSave(created);
      }
      toast.success(initial ? 'Brand updated.' : 'Brand created.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save brand.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Overlay onClose={onClose}>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
        {initial ? 'Edit Brand' : 'New Brand'}
      </h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
          <div>
            <label style={labelStyle}>Name</label>
            <Input value={form.name} onChange={e => { set('name', e.target.value); if (!initial) set('slug', slugify(e.target.value)); }} required disabled={saving} />
          </div>
          <div>
            <label style={labelStyle}>Slug</label>
            <Input value={form.slug} onChange={e => set('slug', e.target.value)} required disabled={saving} readOnly />
          </div>
          <div>
            <label style={labelStyle}>Display Order</label>
            <Input type="number" value={form.displayOrder} onChange={e => set('displayOrder', Number(e.target.value))} disabled={saving} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.2rem' }}>
            <input type="checkbox" id="brand-active" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} disabled={saving} />
            <label htmlFor="brand-active" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>Active</label>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Description</label>
          <Input value={form.description} onChange={e => set('description', e.target.value)} disabled={saving} />
        </div>
        <div>
          <label style={labelStyle}>Image</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {(imageFile || form.imageUrl) && (
              <div style={{ position: 'relative', width: '4rem', height: '4rem', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageFile ? URL.createObjectURL(imageFile) : form.imageUrl} alt="Brand" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" onClick={() => { setImageFile(null); set('imageUrl', ''); }} disabled={saving} style={{ position: 'absolute', top: '2px', right: '2px', width: '1.1rem', height: '1.1rem', backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.65rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Remove image">&times;</button>
              </div>
            )}
            {!imageFile && !form.imageUrl && (
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '4rem', height: '4rem', border: '2px dashed var(--border)', cursor: saving ? 'not-allowed' : 'pointer', backgroundColor: 'var(--surface-muted)', color: 'var(--on-surface-muted)', fontSize: '1.5rem', flexShrink: 0, lineHeight: 1 }}>
              +
              <input type="file" accept="image/*" disabled={saving} style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) setImageFile(f); }} />
            </label>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
          <Button type="button" onClick={onClose} disabled={saving} style={outlineBtn}>Cancel</Button>
          <Button type="submit" disabled={saving} style={primaryBtn}>{saving ? 'Saving…' : 'Save'}</Button>
        </div>
      </form>
    </Overlay>
  );
}

export interface BrandsHandlers {
  onSave:   (saved: Brand) => void;
  onDelete: (id: number) => Promise<void>;
  setModal: (m: Modal | null) => void;
}
