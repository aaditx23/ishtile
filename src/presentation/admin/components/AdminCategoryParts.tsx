'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  uploadCategoryImage,
} from '@/application/category/adminCategory';
import type { Category, Subcategory } from '@/domain/category/category.entity';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ─── Modal discriminant type ──────────────────────────────────────────────────

export type Modal =
  | { type: 'newCat' }
  | { type: 'editCat';  cat: Category }
  | { type: 'newSub';   cat: Category }
  | { type: 'editSub';  sub: Subcategory; cat: Category };

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
      backgroundColor: active ? 'var(--success-bg)' : 'var(--error-bg)',
      color: active ? 'var(--on-success)' : 'var(--on-error)',
    }}>
      {active ? 'Active' : 'Off'}
    </span>
  );
}

export function ActionLinks({
  onEdit, onDelete, deleteDisabled,
}: {
  onEdit:          React.MouseEventHandler;
  onDelete:        React.MouseEventHandler;
  deleteDisabled?: boolean;
}) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem' }}>
      <Button variant="ghost" size="sm" onClick={onEdit} style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--brand-gold)', background: 'none', padding: 0, height: 'auto' }}>Edit</Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={deleteDisabled ? undefined : onDelete}
        title={deleteDisabled ? 'Cannot delete: category has products' : undefined}
        disabled={deleteDisabled}
        style={{
          fontSize: '0.72rem',
          fontWeight: 600,
          color: deleteDisabled ? 'var(--on-surface-muted)' : 'var(--destructive)',
          background: 'none',
          padding: 0,
          height: 'auto',
          cursor: deleteDisabled ? 'not-allowed' : 'pointer',
          opacity: deleteDisabled ? 0.45 : 1,
        }}
      >
        Delete
      </Button>
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

// ─── Category Row ─────────────────────────────────────────────────────────────

export function CategoryRow({
  cat,
  deleteDisabled,
  onEdit,
  onDelete,
  onAddSub,
  onEditSub,
  onDeleteSub,
}: {
  cat:              Category;
  deleteDisabled?:  boolean;
  onEdit:           (c: Category) => void;
  onDelete:         (id: number) => void;
  onAddSub:         (cat: Category) => void;
  onEditSub:        (sub: Subcategory, cat: Category) => void;
  onDeleteSub:      (subId: number, catId: number) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1px solid var(--border)', overflow: 'hidden', backgroundColor: 'var(--surface)' }}>
      {/* Main category card */}
      <div style={{ padding: '0.75rem 1rem' }}>
        {/* Row 1: Image + Name + Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
          {cat.imageUrl && (
            <div style={{ width: '2.5rem', height: '2.5rem', overflow: 'hidden', flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cat.imageUrl} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '0.825rem', fontWeight: 700, margin: 0 }}>{cat.name}</h3>
            <Badge active={cat.isActive} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            <ActionLinks
              onEdit={() => onEdit(cat)}
              onDelete={() => onDelete(cat.id)}
              deleteDisabled={deleteDisabled}
            />
          </div>
        </div>

        {/* Row 2: Slug + Subcategory count + Expand button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.7rem', color: 'var(--on-surface-muted)' }}>
          <span style={{ flex: 1, minWidth: 0, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cat.slug}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(o => !o)}
            style={{
              padding: '0.2rem 0.5rem',
              backgroundColor: open ? 'var(--surface-variant)' : 'transparent',
              fontSize: '0.7rem',
              fontWeight: 600,
              height: 'auto',
              color: 'var(--on-surface-muted)',
              flexShrink: 0,
            }}
          >
            {cat.subcategories.length} sub {open ? '▲' : '▼'}
          </Button>
        </div>
      </div>

      {/* Subcategories list */}
      {open && (
        <div style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface-variant)' }}>
          {cat.subcategories.map((sub, i) => (
            <div
              key={sub.id}
              style={{
                padding: '0.6rem 1rem',
                borderBottom: i < cat.subcategories.length - 1 ? '1px solid var(--border)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{sub.name}</span>
                  <Badge active={sub.isActive} />
                </div>
                <span style={{ fontSize: '0.65rem', fontFamily: 'monospace', color: 'var(--on-surface-muted)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {sub.slug}
                </span>
              </div>
              <div style={{ flexShrink: 0 }}>
                <ActionLinks
                  onEdit={() => onEditSub(sub, cat)}
                  onDelete={() => onDeleteSub(sub.id, cat.id)}
                />
              </div>
            </div>
          ))}
          <Button
            variant="ghost"
            onClick={() => onAddSub(cat)}
            style={{
              display: 'block',
              width: '100%',
              justifyContent: 'flex-start',
              padding: '0.6rem 1rem',
              fontSize: '0.7rem',
              fontWeight: 600,
              color: 'var(--brand-gold)',
              background: 'none',
              height: 'auto',
            }}
          >
            + Add Subcategory
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Category Form Modal ──────────────────────────────────────────────────────

export function CategoryModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: Category;
  onSave:   (c: Category) => void;
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
        payload.imageUrl = await uploadCategoryImage(imageFile);
      }
      if (initial) {
        const updated = await updateCategory(initial.id, payload);
        onSave({ ...initial, ...updated, subcategories: initial.subcategories ?? [] });
      } else {
        const created = await createCategory(payload);
        onSave({ ...created, subcategories: [] });
      }
      toast.success(initial ? 'Category updated.' : 'Category created.');
    } catch { toast.error('Failed to save category.'); }
    finally { setSaving(false); }
  };

  return (
    <Overlay onClose={onClose}>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
        {initial ? 'Edit Category' : 'New Category'}
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
            <input type="checkbox" id="cat-active" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} disabled={saving} />
            <label htmlFor="cat-active" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>Active</label>
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
                <img src={imageFile ? URL.createObjectURL(imageFile) : form.imageUrl} alt="Category" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </div>
      </form>
    </Overlay>
  );
}

// ─── Subcategory Form Modal ───────────────────────────────────────────────────

export function SubcategoryModal({
  categoryId,
  initial,
  onSave,
  onClose,
}: {
  categoryId: number;
  initial?:   Subcategory;
  onSave:     (s: Subcategory) => void;
  onClose:    () => void;
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
      if (initial) {
        const updated = await updateSubcategory(initial.id, payload);
        onSave({ ...initial, ...updated });
      } else {
        const created = await createSubcategory(categoryId, payload);
        onSave(created);
      }
      toast.success(initial ? 'Subcategory updated.' : 'Subcategory created.');
    } catch { toast.error('Failed to save subcategory.'); }
    finally { setSaving(false); }
  };

  return (
    <Overlay onClose={onClose}>
      <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>
        {initial ? 'Edit Subcategory' : 'New Subcategory'}
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
            <input type="checkbox" id="sub-active" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} disabled={saving} />
            <label htmlFor="sub-active" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>Active</label>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Description</label>
          <Input value={form.description} onChange={e => set('description', e.target.value)} disabled={saving} />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </div>
      </form>
    </Overlay>
  );
}

// ─── Mutations hook ───────────────────────────────────────────────────────────

export interface CategoriesHandlers {
  onCatSave:    (saved: Category) => void;
  onCatDelete:  (id: number) => Promise<void>;
  onSubSave:    (saved: Subcategory) => void;
  onSubDelete:  (subId: number, catId: number) => Promise<void>;
  setModal:     (m: Modal | null) => void;
}
