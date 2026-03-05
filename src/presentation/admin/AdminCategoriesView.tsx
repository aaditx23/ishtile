'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import { AdminSidebarNav } from './AdminLayout';
import MobileAdminCategoriesView from './MobileAdminCategoriesView';
import {
  CategoryRow,
  CategoryModal,
  SubcategoryModal,
  primaryBtn,
  type Modal,
} from './components/AdminCategoryParts';
import { getCategories, deleteCategory, deleteSubcategory } from '@/application/category/adminCategory';
import type { Category, Subcategory } from '@/domain/category/category.entity';

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

  const handlers = {
    onCatSave:   handleCatSave,
    onCatDelete: handleCatDelete,
    onSubSave:   handleSubSave,
    onSubDelete: handleSubDelete,
    setModal,
  };

  return (
    <ShopLayout>
      {/* ── Mobile ─────────────────────────────────────────────────────────── */}
      <div className="block lg:hidden">
        <MobileAdminCategoriesView cats={cats} loading={loading} modal={modal} {...handlers} />
      </div>

      {/* ── Desktop ─────────────────────────────────────────────────────────── */}
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
        <AdminSidebarNav activeHref="/admin/categories" />

        <main>
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
        </main>
      </div>
    </ShopLayout>
  );
}
