'use client';

import Link from 'next/link';
import { ADMIN_NAV_ITEMS } from './AdminLayout';
import {
  CategoryRow,
  CategoryModal,
  SubcategoryModal,
  primaryBtn,
  type Modal,
  type CategoriesHandlers,
} from './components/AdminCategoryParts';
import type { Category, Subcategory } from '@/domain/category/category.entity';

interface MobileAdminCategoriesViewProps extends CategoriesHandlers {
  cats:    Category[];
  loading: boolean;
  modal:   Modal | null;
}

export default function MobileAdminCategoriesView({
  cats,
  loading,
  modal,
  onCatSave,
  onCatDelete,
  onSubSave,
  onSubDelete,
  setModal,
}: MobileAdminCategoriesViewProps) {
  return (
    <div style={{ padding: '1.25rem 1rem' }}>

      {/* Admin nav strip */}
      <div
        style={{
          display:        'flex',
          gap:            '0.4rem',
          overflowX:      'auto',
          paddingBottom:  '0.25rem',
          marginBottom:   '1.25rem',
          scrollbarWidth: 'none',
        }}
      >
        {ADMIN_NAV_ITEMS.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            style={{
              display:         'inline-flex',
              alignItems:      'center',
              gap:             '0.3rem',
              padding:         '0.4rem 0.75rem',
              border:          '1px solid var(--border)',
              borderRadius:    '0.5rem',
              fontSize:        '0.75rem',
              fontWeight:      href === '/admin/categories' ? 700 : 500,
              textDecoration:  'none',
              whiteSpace:      'nowrap',
              color:           href === '/admin/categories' ? 'var(--on-primary)' : 'var(--on-surface)',
              backgroundColor: href === '/admin/categories' ? 'var(--primary)' : 'var(--surface)',
              flexShrink:      0,
            }}
          >
            <Icon size={12} />
            {label}
          </Link>
        ))}
      </div>

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Categories</h1>
        <button onClick={() => setModal({ type: 'newCat' })} style={{ ...primaryBtn, padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}>
          + New
        </button>
      </div>

      {/* Category list */}
      {loading ? (
        <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.875rem', padding: '2rem', textAlign: 'center' }}>
          Loading…
        </p>
      ) : cats.length === 0 ? (
        <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.875rem', padding: '2rem', textAlign: 'center' }}>
          No categories yet.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {cats.map(cat => (
            <CategoryRow
              key={cat.id}
              cat={cat}
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
