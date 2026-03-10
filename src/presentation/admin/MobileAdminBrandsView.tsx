'use client';

import { Skeleton } from '@/components/ui/skeleton';
import {
  BrandRow,
  BrandModal,
  primaryBtn,
  type Modal,
  type BrandsHandlers,
} from './components/AdminBrandParts';
import AdminMobileNavStrip from './components/AdminMobileNavStrip';
import type { Brand } from '@/domain/brand/brand.entity';

interface MobileAdminBrandsViewProps extends BrandsHandlers {
  brands:  Brand[];
  loading: boolean;
  modal:   Modal | null;
}

export default function MobileAdminBrandsView({
  brands,
  loading,
  modal,
  onSave,
  onDelete,
  setModal,
}: MobileAdminBrandsViewProps) {
  return (
    <div style={{ padding: '1.25rem 1rem' }}>

      <AdminMobileNavStrip activeHref="/admin/brands" />

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Brands</h1>
        <button onClick={() => setModal({ type: 'new' })} style={{ ...primaryBtn, padding: '0.4rem 0.9rem', fontSize: '0.8rem' }}>
          + New
        </button>
      </div>

      {/* Brand list */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[1,2,3,4,5].map((i) => <Skeleton key={i} style={{ height: '3.25rem', borderRadius: '0.625rem' }} />)}
        </div>
      ) : brands.length === 0 ? (
        <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.875rem', padding: '2rem', textAlign: 'center' }}>
          No brands yet.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {brands.map(brand => (
            <BrandRow
              key={brand.id}
              brand={brand}
              onEdit={b => setModal({ type: 'edit', brand: b })}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {modal?.type === 'new' && (
        <BrandModal onSave={onSave} onClose={() => setModal(null)} />
      )}
      {modal?.type === 'edit' && (
        <BrandModal initial={modal.brand} onSave={onSave} onClose={() => setModal(null)} />
      )}
    </div>
  );
}
