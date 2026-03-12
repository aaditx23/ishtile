'use client';

import { Skeleton } from '@/components/ui/skeleton';
import {
  CategoryRow,
  CategoryModal,
  SubcategoryModal,
  primaryBtn,
  type Modal,
  type CategoriesHandlers,
} from './components/AdminCategoryParts';
import AdminMobileNavStrip from './components/AdminMobileNavStrip';
import type { Category, Subcategory } from '@/domain/category/category.entity';

interface MobileAdminCategoriesViewProps extends CategoriesHandlers {
  cats:                Category[];
  loading:             boolean;
  modal:               Modal | null;
  catIdsWithProducts:  Set<number>;
}

export default function MobileAdminCategoriesView({
  cats,
  loading,
  modal,
  catIdsWithProducts,
  onCatSave,
  onCatDelete,
  onSubSave,
  onSubDelete,
  setModal,
}: MobileAdminCategoriesViewProps) {
  return (
    <div style={{ padding: '1.25rem 1rem' }}>

      <AdminMobileNavStrip activeHref="/admin/categories" />

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.75rem' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Categories</h1>
        <button onClick={() => setModal({ type: 'newCat' })} style={{ ...primaryBtn, padding: '0.4rem 0.9rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
          + New
        </button>
      </div>

      {/* Category list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[1,2,3,4,5].map((i) => <Skeleton key={i} style={{ height: '4.5rem' }} />)}
        </div>
      ) : cats.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--border)', color: 'var(--on-surface-muted)', fontSize: '0.875rem' }}>
          No categories yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {cats.map(cat => (
            <CategoryRow
              key={cat.id}
              cat={cat}
              deleteDisabled={catIdsWithProducts.has(cat.id)}
              onEdit={c => setModal({ type: 'editCat', cat: c })}
              onDelete={onCatDelete}
              onAddSub={c => setModal({ type: 'newSub', cat: c })}
              onEditSub={(sub: Subcategory, c: Category) => setModal({ type: 'editSub', sub, cat: c })}
              onDeleteSub={onSubDelete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {modal?.type === 'newCat' && (
        <CategoryModal onSave={onCatSave} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'editCat' && (
        <CategoryModal initial={modal.cat} onSave={onCatSave} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'newSub' && (
        <SubcategoryModal categoryId={modal.cat.id} onSave={onSubSave} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'editSub' && (
        <SubcategoryModal categoryId={modal.cat.id} initial={modal.sub} onSave={onSubSave} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
