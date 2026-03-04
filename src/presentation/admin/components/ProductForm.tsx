'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { updateProduct } from '@/application/product/adminProduct';
import type { Product } from '@/domain/product/product.entity';
import type { Category } from '@/domain/category/category.entity';
import type { UpdateProductPayload } from '@/domain/product/admin-product.repository';

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
  const [form, setForm] = useState<UpdateProductPayload>({
    name:             product.name,
    slug:             product.slug,
    sku:              product.sku,
    description:      product.description ?? '',
    basePrice:        product.basePrice,
    compareAtPrice:   product.compareAtPrice ?? undefined,
    brand:            product.brand ?? '',
    material:         product.material ?? '',
    careInstructions: product.careInstructions ?? '',
    categoryId:       product.categoryId,
    isActive:         product.isActive,
    isFeatured:       product.isFeatured,
  });
  const [saving, setSaving] = useState(false);

  const set = (key: keyof UpdateProductPayload, value: UpdateProductPayload[typeof key]) =>
    setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProduct(product.id, {
        ...form,
        brand:            form.brand    || undefined,
        material:         form.material || undefined,
        careInstructions: form.careInstructions || undefined,
        description:      form.description || undefined,
        compareAtPrice:   form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
      });
      toast.success('Product saved.');
      router.refresh();
    } catch {
      toast.error('Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Field label="Name">
          <Input value={form.name ?? ''} onChange={(e) => set('name', e.target.value)} required disabled={saving} />
        </Field>
        <Field label="Slug">
          <Input value={form.slug ?? ''} onChange={(e) => set('slug', e.target.value)} required disabled={saving} />
        </Field>
        <Field label="SKU">
          <Input value={form.sku ?? ''} onChange={(e) => set('sku', e.target.value)} required disabled={saving} />
        </Field>
        <Field label="Base Price (৳)">
          <Input type="number" value={form.basePrice ?? ''} onChange={(e) => set('basePrice', Number(e.target.value))} required disabled={saving} />
        </Field>
        <Field label="Compare-at Price (৳)">
          <Input type="number" value={form.compareAtPrice ?? ''} onChange={(e) => set('compareAtPrice', e.target.value ? Number(e.target.value) : undefined)} disabled={saving} />
        </Field>
        <Field label="Category">
          <select
            value={form.categoryId ?? ''}
            onChange={(e) => set('categoryId', Number(e.target.value))}
            disabled={saving}
            style={{
              width:        '100%',
              padding:      '0.5rem 0.75rem',
              borderRadius: '0.5rem',
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
        <Field label="Brand">
          <Input value={form.brand ?? ''} onChange={(e) => set('brand', e.target.value)} disabled={saving} />
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
            borderRadius: '0.5rem',
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

      <Button type="submit" disabled={saving} style={{ alignSelf: 'flex-start', backgroundColor: 'var(--brand-dark)', color: 'var(--on-primary)', minWidth: '8rem' }}>
        {saving ? 'Saving…' : 'Save Product'}
      </Button>
    </form>
  );
}
