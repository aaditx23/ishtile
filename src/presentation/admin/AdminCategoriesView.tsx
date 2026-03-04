'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import AdminLayout from './AdminLayout';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} from '@/application/category/adminCategory';
import type { Category, Subcategory } from '@/domain/category/category.entity';

const labelStyle: React.CSSProperties = {
  fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '0.1em', color: 'var(--on-surface-muted)',
  marginBottom: '0.2rem', display: 'block',
};

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ─── Category Form Modal ──────────────────────────────────────────────────────

function CategoryModal({
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
        imageUrl:     form.imageUrl.trim()    || undefined,
        displayOrder: Number(form.displayOrder),
        isActive:     form.isActive,
      };
      if (initial) {
        const updated = await updateCategory(initial.id, payload);
        // Merge: preserve subcategories from the original
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
          <label style={labelStyle}>Image URL</label>
          <Input value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} disabled={saving} placeholder="https://…" />
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

function SubcategoryModal({
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
        imageUrl:     form.imageUrl.trim()    || undefined,
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
          <label style={labelStyle}>Image URL</label>
          <Input value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} disabled={saving} placeholder="https://…" />
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
          <button type="button" onClick={onClose} disabled={saving} style={outlineBtn}>Cancel</button>
          <button type="submit" disabled={saving} style={primaryBtn}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </Overlay>
  );
}

// ─── Category Row ─────────────────────────────────────────────────────────────

function CategoryRow({
  cat,
  onEdit,
  onDelete,
  onAddSub,
  onEditSub,
  onDeleteSub,
}: {
  cat:        Category;
  onEdit:     (c: Category) => void;
  onDelete:   (id: number) => void;
  onAddSub:   (cat: Category) => void;
  onEditSub:  (sub: Subcategory, cat: Category) => void;
  onDeleteSub:(subId: number, catId: number) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: '1px solid var(--border)', borderRadius: '0.625rem', overflow: 'hidden' }}>
      {/* Category header row */}
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
        />
      </div>

      {/* Subcategory list */}
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

// ─── Small shared components ──────────────────────────────────────────────────

function Badge({ active }: { active: boolean }) {
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

function ActionLinks({
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

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
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

// ─── Style helpers ────────────────────────────────────────────────────────────

const primaryBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center',
  padding: '0.5rem 1.25rem', borderRadius: '0.5rem',
  backgroundColor: 'var(--primary)', color: 'var(--on-primary)',
  border: 'none', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
};

const outlineBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center',
  padding: '0.5rem 1.25rem', borderRadius: '0.5rem',
  backgroundColor: 'transparent', color: 'var(--on-surface)',
  border: '1px solid var(--border)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
};

const actionBtn = (color: string): React.CSSProperties => ({
  fontSize: '0.72rem', fontWeight: 600, color, background: 'none',
  border: 'none', cursor: 'pointer', padding: 0,
});

// ─── Main View ────────────────────────────────────────────────────────────────

type Modal =
  | { type: 'newCat' }
  | { type: 'editCat';  cat: Category }
  | { type: 'newSub';   cat: Category }
  | { type: 'editSub';  sub: Subcategory; cat: Category };

export default function AdminCategoriesView() {
  const [cats, setCats]       = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState<Modal | null>(null);
  const initRef               = useRef(false);

  const fetchCats = useCallback(async () => {
    try {
      const res = await getCategories();
      setCats(res);
    } catch { toast.error('Failed to load categories.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    fetchCats();
  }, [fetchCats]);

  // ── Category mutations ──────────────────────────────────────────────────────

  const handleCatSave = (saved: Category) => {
    setCats(prev => {
      const idx = prev.findIndex(c => c.id === saved.id);
      return idx >= 0 ? prev.map(c => c.id === saved.id ? saved : c) : [...prev, saved];
    });
    setModal(null);
  };

  const handleCatDelete = async (id: number) => {
    if (!confirm('Delete this category? All subcategories will also be removed.')) return;
    try {
      await deleteCategory(id);
      setCats(prev => prev.filter(c => c.id !== id));
      toast.success('Category deleted.');
    } catch { toast.error('Failed to delete category.'); }
  };

  // ── Subcategory mutations ───────────────────────────────────────────────────

  const handleSubSave = (saved: Subcategory) => {
    setCats(prev => prev.map(c => {
      if (c.id !== saved.categoryId) return c;
      const idx = c.subcategories.findIndex(s => s.id === saved.id);
      const subs = idx >= 0
        ? c.subcategories.map(s => s.id === saved.id ? saved : s)
        : [...c.subcategories, saved];
      return { ...c, subcategories: subs };
    }));
    setModal(null);
  };

  const handleSubDelete = async (subId: number, catId: number) => {
    if (!confirm('Delete this subcategory?')) return;
    try {
      await deleteSubcategory(subId);
      setCats(prev => prev.map(c => c.id !== catId ? c : {
        ...c,
        subcategories: c.subcategories.filter(s => s.id !== subId),
      }));
      toast.success('Subcategory deleted.');
    } catch { toast.error('Failed to delete subcategory.'); }
  };

  return (
    <AdminLayout activeHref="/admin/categories">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Categories</h1>
          <button onClick={() => setModal({ type: 'newCat' })} style={primaryBtn}>
            + New Category
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.875rem', padding: '2rem', textAlign: 'center' }}>
            Loading…
          </p>
        ) : cats.length === 0 ? (
          <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.875rem', padding: '2rem', textAlign: 'center' }}>
            No categories yet. Create one to get started.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {cats.map(cat => (
              <CategoryRow
                key={cat.id}
                cat={cat}
                onEdit={c => setModal({ type: 'editCat', cat: c })}
                onDelete={handleCatDelete}
                onAddSub={c => setModal({ type: 'newSub', cat: c })}
                onEditSub={(sub, c) => setModal({ type: 'editSub', sub, cat: c })}
                onDeleteSub={handleSubDelete}
              />
            ))}
          </div>
        )}
      </div>

      {modal?.type === 'newCat' && (
        <CategoryModal onSave={handleCatSave} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'editCat' && (
        <CategoryModal initial={modal.cat} onSave={handleCatSave} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'newSub' && (
        <SubcategoryModal
          categoryId={modal.cat.id}
          onSave={handleSubSave}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'editSub' && (
        <SubcategoryModal
          categoryId={modal.cat.id}
          initial={modal.sub}
          onSave={handleSubSave}
          onClose={() => setModal(null)}
        />
      )}
    </AdminLayout>
  );
}
