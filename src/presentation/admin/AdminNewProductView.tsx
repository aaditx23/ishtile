'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import { AdminSidebarNav } from './AdminLayout';
import AdminMobileNavStrip from './components/AdminMobileNavStrip';
import { createProduct, uploadProductImages } from '@/application/product/adminProduct';
import { getCategories } from '@/application/category/getCategories';
import { getBrands } from '@/application/brand/getBrands';
import { buildUploadSizeError, splitFilesByUploadLimit } from '@/presentation/admin/utils/uploadValidation';
import type { Category } from '@/domain/category/category.entity';
import type { Brand } from '@/domain/brand/brand.entity';

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

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
  const [brands, setBrands] = useState<Brand[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [form, setForm] = useState({
    name:           '',
    slug:           '',
    sku:            '',
    categoryId:     0,
    subcategoryId:  undefined as number | undefined,
    brandId:        undefined as number | undefined,
    material:       '',
    description:    '',
    isActive:       true,
    isFeatured:     false,
    trending:       false,
  });
  // Dynamic variants
  const [variants, setVariants] = useState([{
    id:             Date.now(),
    size:           '',
    color:          '',
    sku:            '',
    price:          '',
    compareAtPrice: '',
    quantity:       '',
  }]);
  const [images, setImages]   = useState<File[]>([]);
  const [saving, setSaving]   = useState(false);
  const [savingMsg, setSavingMsg] = useState('');

  const handleImagesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const { accepted, rejected } = splitFilesByUploadLimit(Array.from(files));
    if (rejected.length > 0) {
      toast.error(buildUploadSizeError(rejected));
    }
    if (accepted.length > 0) {
      setImages((prev) => [...prev, ...accepted]);
    }
  };

  useEffect(() => {
    Promise.all([
      getCategories({ activeOnly: true }),
      getBrands({ activeOnly: false }),
    ])
      .then(([cats, brds]) => {
        setCategories(cats);
        setBrands(brds);
        // Set categoryId to the first loaded category
        if (cats.length > 0) setForm(p => ({ ...p, categoryId: cats[0].id }));
      })
      .catch(() => toast.error('Failed to load data.'))
      .finally(() => setCatsLoading(false));
  }, []);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const setV = (id: number, k: keyof typeof variants[0], v: string) =>
    setVariants(p => p.map(variant => variant.id === id ? { ...variant, [k]: v } : variant));

  const removeV = (id: number) =>
    setVariants(p => p.filter(v => v.id !== id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.categoryId === 0) { toast.error('Please select a category.'); return; }
    if (variants.length === 0) { toast.error('At least one variant is required.'); return; }
    
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.size.trim())   { toast.error(`Variant ${i + 1} size is required.`); return; }
      if (!v.color.trim())  { toast.error(`Variant ${i + 1} color is required.`); return; }
      if (!v.sku.trim())    { toast.error(`Variant ${i + 1} SKU is required.`); return; }
      if (!v.price)         { toast.error(`Variant ${i + 1} price is required.`); return; }
      if (!v.quantity)      { toast.error(`Variant ${i + 1} quantity is required.`); return; }
    }

    setSaving(true);
    try {
      // Upload images first if any
      let imageUrls: string[] | undefined;
      if (images.length > 0) {
        setSavingMsg('Uploading images…');
        imageUrls = await uploadProductImages(images);
      }
      setSavingMsg('Creating product…');

      // API requires product-level prices, we'll derive them from variants
      const basePrice = Math.min(...variants.map(v => Number(v.price)));
      const maxCompare = Math.max(...variants.map(v => Number(v.compareAtPrice || 0)));
      const compareAtPrice = maxCompare > 0 ? maxCompare : undefined;

      const product = await createProduct({
        name:           form.name,
        slug:           form.slug,
        sku:            form.sku,
        basePrice,
        compareAtPrice,
        categoryId:     form.categoryId,
        subcategoryId:  form.subcategoryId,
        brandId:        form.brandId,
        material:       form.material || undefined,
        description:    form.description || undefined,
        isActive:       form.isActive,
        isFeatured:     form.isFeatured,
        trending:       form.trending,
        imageUrls,
        variants: variants.map(v => ({
          size:           v.size.trim(),
          color:          v.color.trim(),
          sku:            v.sku.trim(),
          price:          Number(v.price),
          compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
          quantity:       Number(v.quantity),
          isActive:       true,
        })),
      });
      toast.success('Product created.');
      router.push(`/admin/products/${product.id}`);
    } catch {
      toast.error('Failed to create product.');
      setSaving(false);
      setSavingMsg('');
    }
  };

  return (
    <ShopLayout>
      {/* Mobile-only nav */}
      <div className="lg:hidden" style={{ padding: '1.25rem 1rem 0' }}>
        <AdminMobileNavStrip activeHref="/admin/products" />
      </div>

      <div style={{ maxWidth: '84rem', margin: '0 auto', padding: '1.25rem 1.25rem 2rem' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'start' }}>
          {/* Sidebar — desktop only */}
          <div className="hidden lg:block" style={{ width: '13rem', flexShrink: 0 }}>
            <AdminSidebarNav activeHref="/admin/products" />
          </div>

          {/* Main content */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Button asChild variant="ghost" style={{ paddingLeft: 0 }}>
                <Link href="/admin/products">← Products</Link>
              </Button>
              <h1 style={{ fontSize: '1.1rem', fontWeight: 700 }}>New Product</h1>
            </div>

            <div style={{ border: '1px solid var(--border)', padding: '1.5rem', backgroundColor: 'var(--surface)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Field label="Name">
                <Input value={form.name} onChange={(e) => { set('name', e.target.value); set('slug', slugify(e.target.value)); }} required disabled={saving} />
              </Field>
              <Field label="Slug">
                <Input value={form.slug} onChange={(e) => set('slug', e.target.value)} required disabled={saving} readOnly />
              </Field>
              <Field label="SKU">
                <Input value={form.sku} onChange={(e) => set('sku', e.target.value)} required disabled={saving} />
              </Field>
              <Field label="Category">
                <select
                  value={form.categoryId}
                  onChange={(e) => {
                    set('categoryId', e.target.value as unknown as number);
                    set('subcategoryId', undefined);
                  }}
                  disabled={saving || catsLoading}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border)', fontSize: '0.875rem', backgroundColor: 'var(--surface)', color: 'inherit' }}
                >
                  {catsLoading
                    ? <option>Loading…</option>
                    : categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  }
                </select>
              </Field>

              {(() => {
                const subcats = categories.find((c) => c.id === form.categoryId)?.subcategories ?? [];
                if (subcats.length === 0) return null;
                return (
                  <Field label="Subcategory">
                    <select
                      value={form.subcategoryId ?? ''}
                      onChange={(e) => set('subcategoryId', e.target.value ? (e.target.value as unknown as number) : undefined)}
                      disabled={saving}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border)', fontSize: '0.875rem', backgroundColor: 'var(--surface)', color: 'inherit' }}
                    >
                      <option value="">— None —</option>
                      {subcats.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </Field>
                );
              })()}
              
              <Field label="Brand">
                <select
                  value={form.brandId ?? ''}
                  onChange={(e) => set('brandId', e.target.value ? (e.target.value as unknown as number) : undefined)}
                  disabled={saving || catsLoading}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border)', fontSize: '0.875rem', backgroundColor: 'var(--surface)', color: 'inherit' }}
                >
                  <option value="">— None —</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
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
                style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid var(--border)', fontSize: '0.875rem', resize: 'vertical', backgroundColor: 'var(--surface)', color: 'inherit', fontFamily: 'inherit' }}
              />
            </Field>

            {/* Images upload */}
            <div>
              <label style={labelStyle}>Images (optional)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {/* Preview thumbnails of selected files */}
                {images.map((file, i) => (
                  <div
                    key={i}
                    style={{ position: 'relative', width: '4rem', height: '4rem', overflow: 'hidden', border: '2px dashed var(--primary)', flexShrink: 0 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={URL.createObjectURL(file)} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                      disabled={saving}
                      style={{ position: 'absolute', top: '2px', right: '2px', width: '1.1rem', height: '1.1rem', backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.65rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      aria-label="Remove image"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                {/* Upload-more box */}
                <label
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '4rem', height: '4rem', border: '2px dashed var(--border)', cursor: saving ? 'not-allowed' : 'pointer', backgroundColor: 'var(--surface-muted)', color: 'var(--on-surface-muted)', fontSize: '1.5rem', flexShrink: 0, lineHeight: 1 }}
                >
                  +
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={saving}
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      handleImagesSelected(e.target.files);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} disabled={saving} />
                Active
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} disabled={saving} />
                Featured
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.trending} onChange={(e) => set('trending', e.target.checked)} disabled={saving} />
                Trending
              </label>
            </div>

            {/* Variants */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-muted)' }}>
                  Variants
                </p>
                <button
                  type="button"
                  onClick={() => setVariants(p => [...p, { id: Date.now(), size: '', color: '', sku: form.sku ? `${form.sku}-NEW` : '', price: '', compareAtPrice: '', quantity: '' }])}
                  disabled={saving}
                  style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.4rem 0.75rem', backgroundColor: 'var(--surface-variant)', border: '1px solid var(--border)', cursor: 'pointer' }}
                >
                  + Add Variant
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {variants.map((v, i) => (
                  <div
                    key={v.id}
                    className="grid grid-cols-2 lg:grid-cols-[minmax(4rem,1fr)_minmax(5rem,1fr)_minmax(6rem,1fr)_minmax(4rem,1fr)_minmax(4rem,1fr)_minmax(4rem,1fr)_auto] items-end gap-2"
                    style={{ borderTop: i > 0 ? '1px dashed var(--border)' : undefined, paddingTop: i > 0 ? '1rem' : undefined }}
                  >
                    <Field label="Size">
                      <select
                        value={v.size}
                        onChange={(e) => setV(v.id, 'size', e.target.value)}
                        required
                        disabled={saving}
                        style={{ width: '100%', padding: '0.45rem 0.75rem', border: '1px solid var(--border)', fontSize: '0.875rem', backgroundColor: 'var(--surface)', color: 'inherit' }}
                      >
                        <option value="" disabled hidden>Size</option>
                        {['S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(sz => (
                          <option key={sz} value={sz}>{sz}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Color">
                      <Input value={v.color} onChange={(e) => setV(v.id, 'color', e.target.value)} required disabled={saving} placeholder="Red" />
                    </Field>
                    {/* SKU spans full width on mobile, 1 col on desktop */}
                    <div className="col-span-2 lg:col-span-1">
                      <Field label="SKU">
                        <Input value={v.sku} onChange={(e) => setV(v.id, 'sku', e.target.value)} required disabled={saving} placeholder="SKU-001-M" />
                      </Field>
                    </div>
                    <Field label="Price">
                      <Input type="number" value={v.price} onChange={(e) => setV(v.id, 'price', e.target.value)} required disabled={saving} placeholder="৳" />
                    </Field>
                    <Field label="Compare">
                      <Input type="number" value={v.compareAtPrice} onChange={(e) => setV(v.id, 'compareAtPrice', e.target.value)} disabled={saving} placeholder="৳" />
                    </Field>
                    <Field label="Qty">
                      <Input type="number" value={v.quantity} onChange={(e) => setV(v.id, 'quantity', e.target.value)} required disabled={saving} min="0" />
                    </Field>
                    {/* Remove: sits next to Qty on mobile, last col on desktop */}
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => removeV(v.id)}
                        disabled={saving || variants.length === 1}
                        style={{ height: '40px', width: '100%', padding: '0 0.5rem', border: '1px solid var(--error-bg)', backgroundColor: 'var(--error-bg)', color: 'var(--on-error)', fontSize: '0.75rem', fontWeight: 600, cursor: variants.length === 1 ? 'not-allowed' : 'pointer', opacity: variants.length === 1 ? 0.5 : 1 }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={saving} style={{ alignSelf: 'flex-start', minWidth: '9rem' }}>
              {saving ? (savingMsg || 'Creating…') : 'Create Product'}
            </Button>
          </form>
            </div>
          </div>
        </div>
      </div>
    </ShopLayout>
  );
}
