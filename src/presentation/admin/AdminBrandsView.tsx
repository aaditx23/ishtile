'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import { AdminSidebarNav } from './AdminLayout';
import MobileAdminBrandsView from './MobileAdminBrandsView';
import { BrandRow, BrandModal, primaryBtn, type Modal } from './components/AdminBrandParts';
import { Skeleton } from '@/components/ui/skeleton';
import { getBrands } from '@/application/brand/getBrands';
import { deleteBrand } from '@/application/brand/adminBrand';
import type { Brand } from '@/domain/brand/brand.entity';

export default function AdminBrandsView() {
  const [brands, setBrands]   = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState<Modal | null>(null);
  const initRef               = useRef(false);

  const fetchBrands = useCallback(async () => {
    try {
      const res = await getBrands({ activeOnly: false });
      setBrands(res);
    } catch { toast.error('Failed to load brands.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    fetchBrands();
  }, [fetchBrands]);

  const handleSave = (saved: Brand) => {
    setBrands(prev => {
      const idx = prev.findIndex(b => b.id === saved.id);
      return idx >= 0 ? prev.map(b => b.id === saved.id ? saved : b) : [...prev, saved];
    });
    setModal(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this brand?')) return;
    try {
      await deleteBrand(id);
      setBrands(prev => prev.filter(b => b.id !== id));
      toast.success('Brand deleted.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete brand.';
      toast.error(msg);
    }
  };

  const handlers = { onSave: handleSave, onDelete: handleDelete, setModal };

  return (
    <ShopLayout>
      {/* ── Mobile ─────────────────────────────────────────────────────────── */}
      <div className="block lg:hidden">
        <MobileAdminBrandsView brands={brands} loading={loading} modal={modal} {...handlers} />
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
        <AdminSidebarNav activeHref="/admin/brands" />

        <main>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Brands</h1>
              <button onClick={() => setModal({ type: 'new' })} style={primaryBtn}>
                + New Brand
              </button>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {[1,2,3,4,5].map((i) => <Skeleton key={i} style={{ height: '3.25rem' }} />)}
              </div>
            ) : brands.length === 0 ? (
              <p style={{ color: 'var(--on-surface-muted)', fontSize: '0.875rem', padding: '2rem', textAlign: 'center' }}>
                No brands yet. Create one to get started.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {brands.map(brand => (
                  <BrandRow
                    key={brand.id}
                    brand={brand}
                    onEdit={(b: Brand) => setModal({ type: 'edit', brand: b })}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>

          {modal?.type === 'new' && (
            <BrandModal onSave={handleSave} onClose={() => setModal(null)} />
          )}
          {modal?.type === 'edit' && (
            <BrandModal initial={modal.brand} onSave={handleSave} onClose={() => setModal(null)} />
          )}
        </main>
      </div>
    </ShopLayout>
  );
}
