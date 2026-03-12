'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updateProduct, uploadProductImages } from '@/application/product/adminProduct';
import { getBrands } from '@/application/brand/getBrands';
import type { Product } from '@/domain/product/product.entity';
import type { Category } from '@/domain/category/category.entity';
import type { Brand } from '@/domain/brand/brand.entity';
import type { UpdateProductPayload } from '@/domain/product/admin-product.repository';

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

interface ProductFormProps {
  product:    Product;
  categories: Category[];
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

export default function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [form, setForm] = useState<UpdateProductPayload>({
    name:             product.name,
    slug:             product.slug,
    sku:              product.sku,
    description:      product.description ?? '',
    brandId:          product.brandId ?? undefined,
    material:         product.material ?? '',
    careInstructions: product.careInstructions ?? '',
    categoryId:       product.categoryId,
    subcategoryId:    product.subcategoryId ?? undefined,
    isActive:         product.isActive,
    isFeatured:       product.isFeatured,
  });
  const [saving, setSaving] = useState(false);
  const [savingMsg, setSavingMsg] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>(product.imageUrls ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  useEffect(() => {
    getBrands({ activeOnly: false }).then(setBrands).catch(() => toast.error('Failed to load brands'));
  }, []);

  const set = (key: keyof UpdateProductPayload, value: UpdateProductPayload[typeof key]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalImageUrls = imageUrls;
      if (newFiles.length > 0) {
        setSavingMsg('Uploading images...');
        const uploaded = await uploadProductImages(newFiles);
        finalImageUrls = [...imageUrls, ...uploaded];
        setImageUrls(finalImageUrls);
        setNewFiles([]);
      }
      setSavingMsg('Saving...');
      await updateProduct(product.id, {
        ...form,
        material:         form.material || undefined,
        careInstructions: form.careInstructions || undefined,
        description:      form.description || undefined,
        imageUrls:        finalImageUrls.length ? finalImageUrls : undefined,
      });
      toast.success('Product saved.');
      router.refresh();
    } catch {
      toast.error('Failed to save product.');
    } finally {
      setSaving(false);
      setSavingMsg('');
    }
  };

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Field label="Name">
          <Input value={form.name ?? ''} onChange={(e) => { set('name', e.target.value); set('slug', slugify(e.target.value)); }} required disabled={saving} />
        </Field>
        <Field label="Slug">
          <Input value={form.slug ?? ''} onChange={(e) => set('slug', e.target.value)} required disabled={saving} readOnly />
        </Field>
        <Field label="SKU">
          <Input value={form.sku ?? ''} onChange={(e) => set('sku', e.target.value)} required disabled={saving} />
        </Field>

        <Field label="Category">
          <select
            value={form.categoryId ?? ''}
            onChange={(e) => {
              set('categoryId', e.target.value as unknown as number);
              set('subcategoryId', undefined);
            }}
            disabled={saving}
            style={{
              width:        '100%',
              padding:      '0.5rem 0.75rem',
              border:       '1px solid var(--border)',
              fontSize:     '0.875rem',
              backgroundColor: 'var(--surface)',
              color:        'inherit',
            }}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
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
                style={{
                  width:        '100%',
                  padding:      '0.5rem 0.75rem',
                  border:       '1px solid var(--border)',
                  fontSize:     '0.875rem',
                  backgroundColor: 'var(--surface)',
                  color:        'inherit',
                }}
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
            disabled={saving}
            style={{
              width:        '100%',
              padding:      '0.5rem 0.75rem',
              border:       '1px solid var(--border)',
              fontSize:     '0.875rem',
              backgroundColor: 'var(--surface)',
              color:        'inherit',
            }}
          >
            <option value="">— None —</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </Field>
        
        <Field label="Material">
          <Input value={form.material ?? ''} onChange={(e) => set('material', e.target.value)} disabled={saving} />
        </Field>
      </div>

      <Field label="Description">
        <textarea
          value={form.description ?? ''}
          onChange={(e) => set('description', e.target.value)}
          rows={3}
          disabled={saving}
          style={{
            width:        '100%',
            padding:      '0.5rem 0.75rem',
            border:       '1px solid var(--border)',
            fontSize:     '0.875rem',
            resize:       'vertical',
            backgroundColor: 'var(--surface)',
            color:        'inherit',
            fontFamily:   'inherit',
          }}
        />
      </Field>

      <Field label="Care Instructions">
        <Input value={form.careInstructions ?? ''} onChange={(e) => set('careInstructions', e.target.value)} disabled={saving} />
      </Field>

      {/* Images */}
      <div>
        <label style={labelStyle}>Images</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {/* Existing image thumbnails */}
          {imageUrls.map((url, i) => (
            <div
              key={url}
              style={{ position: 'relative', width: '4rem', height: '4rem', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Product image ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => setImageUrls((prev) => prev.filter((_, idx) => idx !== i))}
                disabled={saving}
                style={{ position: 'absolute', top: '2px', right: '2px', width: '1.1rem', height: '1.1rem', backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.65rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Remove image"
              >
                &times;
              </button>
            </div>
          ))}
          {/* Previews of newly selected files (dashed border = not yet uploaded) */}
          {newFiles.map((file, i) => (
            <div
              key={`new-${i}`}
              style={{ position: 'relative', width: '4rem', height: '4rem', overflow: 'hidden', border: '2px dashed var(--primary)', flexShrink: 0 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={URL.createObjectURL(file)} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                type="button"
                onClick={() => setNewFiles((prev) => prev.filter((_, idx) => idx !== i))}
                disabled={saving}
                style={{ position: 'absolute', top: '2px', right: '2px', width: '1.1rem', height: '1.1rem', backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '0.65rem', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                aria-label="Remove new image"
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
              onChange={(e) => setNewFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])}
            />
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={form.isActive ?? true} onChange={(e) => set('isActive', e.target.checked)} disabled={saving} />
          Active
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={form.isFeatured ?? false} onChange={(e) => set('isFeatured', e.target.checked)} disabled={saving} />
          Featured
        </label>
      </div>

      <Button type="submit" disabled={saving} style={{ alignSelf: 'flex-start', minWidth: '8rem' }}>
        {saving ? (savingMsg || 'Saving...') : 'Save Product'}
      </Button>
    </form>
  );
}
