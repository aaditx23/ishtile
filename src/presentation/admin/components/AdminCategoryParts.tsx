'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
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
  padding: '0.5rem 1.25rem', borderRadius: '0.5rem',
  backgroundColor: 'var(--primary)', color: 'var(--on-primary)',
  border: 'none', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
};

export const outlineBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center',
  padding: '0.5rem 1.25rem', borderRadius: '0.5rem',
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
      borderRadius: '9999px', textTransform: 'uppercase',
      backgroundColor: active ? '#d1fae5' : '#fee2e2',
      color: active ? '#065f46' : '#991b1b',
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
      <button onClick={onEdit} style={actionBtn('#A58C69')}>Edit</button>
      <button
        onClick={deleteDisabled ? undefined : onDelete}
        title={deleteDisabled ? 'Cannot delete: category has products' : undefined}
        style={{
          ...actionBtn(deleteDisabled ? 'var(--on-surface-muted)' : 'var(--destructive)'),
          cursor: deleteDisabled ? 'not-allowed' : 'pointer',
          opacity: deleteDisabled ? 0.45 : 1,
        }}
      >
        Delete
      </button>
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
        backgroundColor: 'var(--surface)', borderRadius: '0.75rem',
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
    <div style={{ border: '1px solid var(--border)', borderRadius: '0.625rem', overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.75rem 1rem', backgroundColor: 'var(--surface)',
        cursor: 'pointer',
      }} onClick={() => setOpen(o => !o)}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, flex: 1 }}>{cat.name}</span>
        <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--on-surface-muted)' }}>{cat.slug}</span>
        <Badge active={cat.isActive} />
        <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-muted)' }}>
          {cat.subcategories.length} sub
        </span>
        <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-muted)' }}>{open ? '▲' : '▼'}</span>
        <ActionLinks
          onEdit={e => { e.stopPropagation(); onEdit(cat); }}
          onDelete={e => { e.stopPropagation(); onDelete(cat.id); }}
          deleteDisabled={deleteDisabled}
        />
      </div>

      {open && (
        <div style={{ borderTop: '1px solid var(--border)', backgroundColor: 'var(--surface-variant)' }}>
          {cat.subcategories.map(sub => (
            <div key={sub.id} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.55rem 1rem 0.55rem 2rem',
              borderBottom: '1px solid var(--border)',
              fontSize: '0.8rem',
            }}>
              <span style={{ flex: 1, fontWeight: 500 }}>{sub.name}</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--on-surface-muted)' }}>{sub.slug}</span>
              <Badge active={sub.isActive} />
              <ActionLinks
                onEdit={e => { e.stopPropagation(); onEditSub(sub, cat); }}
                onDelete={e => { e.stopPropagation(); onDeleteSub(sub.id, cat.id); }}
              />
            </div>
          ))}
          <button
            onClick={() => onAddSub(cat)}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '0.5rem 1rem 0.5rem 2rem', fontSize: '0.75rem',
              fontWeight: 600, color: 'var(--on-surface-muted)',
              background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            + Add Subcategory
          </button>
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
            <Input value={form.slug} onChange={e => set('slug', e.target.value)} required disabled={saving} />
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
              <div style={{ position: 'relative', width: '4rem', height: '4rem', borderRadius: '0.375rem', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageFile ? URL.createObjectURL(imageFile) : form.imageUrl} alt="Category" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" onClick={() => { setImageFile(null); set('imageUrl', ''); }} disabled={saving} style={{ position: 'absolute', top: '2px', right: '2px', width: '1.1rem', height: '1.1rem', borderRadius: '9999px', backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.65rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Remove image">&times;</button>
              </div>
            )}
            {!imageFile && !form.imageUrl && (
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '4rem', height: '4rem', borderRadius: '0.375rem', border: '2px dashed var(--border)', cursor: saving ? 'not-allowed' : 'pointer', backgroundColor: 'var(--surface-muted)', color: 'var(--on-surface-muted)', fontSize: '1.5rem', flexShrink: 0, lineHeight: 1 }}>
              +
              <input type="file" accept="image/*" disabled={saving} style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) setImageFile(f); }} />
            </label>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
          <button type="button" onClick={onClose} disabled={saving} style={outlineBtn}>Cancel</button>
          <button type="submit" disabled={saving} style={primaryBtn}>{saving ? 'Saving…' : 'Save'}</button>
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
            <Input value={form.slug} onChange={e => set('slug', e.target.value)} required disabled={saving} />
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
        <div>
          <label style={labelStyle}>Image</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {(imageFile || form.imageUrl) && (
              <div style={{ position: 'relative', width: '4rem', height: '4rem', borderRadius: '0.375rem', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageFile ? URL.createObjectURL(imageFile) : form.imageUrl} alt="Subcategory" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" onClick={() => { setImageFile(null); set('imageUrl', ''); }} disabled={saving} style={{ position: 'absolute', top: '2px', right: '2px', width: '1.1rem', height: '1.1rem', borderRadius: '9999px', backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.65rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label="Remove image">&times;</button>
              </div>
            )}
            {!imageFile && !form.imageUrl && (
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '4rem', height: '4rem', borderRadius: '0.375rem', border: '2px dashed var(--border)', cursor: saving ? 'not-allowed' : 'pointer', backgroundColor: 'var(--surface-muted)', color: 'var(--on-surface-muted)', fontSize: '1.5rem', flexShrink: 0, lineHeight: 1 }}>
              +
              <input type="file" accept="image/*" disabled={saving} style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) setImageFile(f); }} />
            </label>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
          <button type="button" onClick={onClose} disabled={saving} style={outlineBtn}>Cancel</button>
          <button type="submit" disabled={saving} style={primaryBtn}>{saving ? 'Saving…' : 'Save'}</button>
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
