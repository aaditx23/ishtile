'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import AdminLayout from './AdminLayout';
import { createProduct } from '@/application/product/adminProduct';
import { getCategories } from '@/application/category/getCategories';
import type { Category } from '@/domain/category/category.entity';

const labelStyle: React.CSSProperties = {
  fontSize:      '0.65rem',
  fontWeight:    700,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color:         'var(--on-surface-muted)',
  marginBottom:  '0.2rem',
  display:       'block',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

export default function AdminNewProductView() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [form, setForm] = useState({
    name:           '',
    slug:           '',
    sku:            '',
    basePrice:      '',
    compareAtPrice: '',
    categoryId:     categories[0]?.id ?? 0,
    brand:          '',
    material:       '',
    description:    '',
    isActive:       true,
    isFeatured:     false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCategories({ activeOnly: true })
      .then(setCategories)
      .catch(() => toast.error('Failed to load categories.'))
      .finally(() => setCatsLoading(false));
  }, []);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const product = await createProduct({
        name:           form.name,
        slug:           form.slug,
        sku:            form.sku,
        basePrice:      Number(form.basePrice),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
        categoryId:     form.categoryId,
        brand:          form.brand    || undefined,
        material:       form.material || undefined,
        description:    form.description || undefined,
        isActive:       form.isActive,
        isFeatured:     form.isFeatured,
      });
      toast.success('Product created.');
      router.push(`/admin/products/${product.id}`);
    } catch {
      toast.error('Failed to create product.');
      setSaving(false);
    }
  };

  return (
    <AdminLayout activeHref="/admin/products">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button asChild variant="ghost" style={{ paddingLeft: 0 }}>
            <Link href="/admin/products">← Products</Link>
          </Button>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>New Product</h1>
        </div>

        <div style={{ border: '1px solid var(--border)', borderRadius: '0.75rem', padding: '1.5rem', backgroundColor: 'var(--surface)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="Name">
                <Input value={form.name} onChange={(e) => set('name', e.target.value)} required disabled={saving} />
              </Field>
              <Field label="Slug">
                <Input value={form.slug} onChange={(e) => set('slug', e.target.value)} required disabled={saving} />
              </Field>
              <Field label="SKU">
                <Input value={form.sku} onChange={(e) => set('sku', e.target.value)} required disabled={saving} />
              </Field>
              <Field label="Base Price (৳)">
                <Input type="number" value={form.basePrice} onChange={(e) => set('basePrice', e.target.value)} required disabled={saving} />
              </Field>
              <Field label="Compare-at Price (৳)">
                <Input type="number" value={form.compareAtPrice} onChange={(e) => set('compareAtPrice', e.target.value)} disabled={saving} />
              </Field>
              <Field label="Category">
                <select
                  value={form.categoryId}
                  onChange={(e) => set('categoryId', Number(e.target.value))}
                  disabled={saving || catsLoading}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '0.875rem', backgroundColor: 'var(--surface)', color: 'inherit' }}
                >
                  {catsLoading
                    ? <option>Loading…</option>
                    : categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  }
                </select>
              </Field>
              <Field label="Brand">
                <Input value={form.brand} onChange={(e) => set('brand', e.target.value)} disabled={saving} />
              </Field>
              <Field label="Material">
                <Input value={form.material} onChange={(e) => set('material', e.target.value)} disabled={saving} />
              </Field>
            </div>
            <Field label="Description">
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={3}
                disabled={saving}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '0.875rem', resize: 'vertical', backgroundColor: 'var(--surface)', color: 'inherit', fontFamily: 'inherit' }}
              />
            </Field>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} disabled={saving} />
                Active
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} disabled={saving} />
                Featured
              </label>
            </div>
            <Button type="submit" disabled={saving} style={{ alignSelf: 'flex-start', backgroundColor: 'var(--brand-dark)', color: 'var(--on-primary)', minWidth: '9rem' }}>
              {saving ? 'Creating…' : 'Create Product'}
            </Button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
