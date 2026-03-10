'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  updateVariant,
  createVariant,
  deleteVariant,
  getInventory,
  updateInventory,
} from '@/application/product/adminProduct';
import type { ProductVariant } from '@/domain/product/product.entity';
import type { InventoryDto } from '@/shared/types/api.types';

interface VariantManagerProps {
  productId:       number;
  initialVariants: ProductVariant[];
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

function InvCell({ variantId }: { variantId: number }) {
  const [inv, setInv]   = useState<InventoryDto | null>(null);
  const [qty, setQty]   = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setBusy(true);
    try {
      const data = await getInventory(variantId);
      setInv(data);
      setQty(String(data.quantity));
    } catch { toast.error('Could not load inventory.'); }
    finally { setBusy(false); }
  };

  // Auto-fetch on mount
  useEffect(() => { void load(); }, [variantId]);

  const save = async () => {
    if (!inv) return;
    setBusy(true);
    try {
      const updated = await updateInventory(variantId, { quantity: Number(qty) });
      setInv(updated);
      setQty(String(updated.quantity));
      toast.success('Inventory saved.');
    } catch { toast.error('Failed to save inventory.'); }
    finally { setBusy(false); }
  };

  if (!inv) {
    return (
      <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-muted)' }}>
        {busy ? '…' : '—'}
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
      <Input
        type="number"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        style={{ width: '4.5rem', padding: '0.25rem 0.5rem', fontSize: '0.78rem' }}
        disabled={busy}
      />
      <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-muted)' }}>/ {inv.availableQuantity}</span>
      <button
        onClick={save}
        disabled={busy}
        style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--brand-gold)', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        {busy ? '…' : 'Save'}
      </button>
    </div>
  );
}

function VariantRow({
  variant,
  onSaved,
  onDelete,
  canDelete,
  disabled,
}: {
  variant:  ProductVariant;
  onSaved:  (v: ProductVariant) => void;
  onDelete?: () => void;
  canDelete?: boolean;
  disabled?: boolean;
}) {
  const [form, setForm] = useState({
    size:  variant.size,
    color: variant.color ?? '',
    sku:   variant.sku,
    price: String(variant.price),
    compareAtPrice: variant.compareAtPrice ? String(variant.compareAtPrice) : '',
    isActive: variant.isActive,
  });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (form.compareAtPrice && Number(form.compareAtPrice) <= Number(form.price)) {
      toast.error('Compare at price must be greater than price.');
      return;
    }
    setBusy(true);
    try {
      const updated = await updateVariant(variant.id, {
        size:     form.size,
        color:    form.color || undefined,
        sku:      form.sku,
        price:    Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
        isActive: form.isActive,
      });
      onSaved(updated);
      toast.success('Variant saved.');
    } catch { 
      toast.error('Failed to save variant.'); 
    } finally { 
      setBusy(false); 
    }
  };

  const hasChanges = 
    form.size !== variant.size ||
    form.color !== (variant.color ?? '') ||
    form.sku !== variant.sku ||
    form.price !== String(variant.price) ||
    form.compareAtPrice !== (variant.compareAtPrice ? String(variant.compareAtPrice) : '') ||
    form.isActive !== variant.isActive;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-[minmax(4rem,1fr)_minmax(5rem,1fr)_minmax(6rem,1fr)_minmax(4rem,1fr)_minmax(4rem,1fr)_minmax(5rem,1fr)_auto_auto] items-end gap-2">
      <Field label="Size">
        <select
          value={form.size}
          onChange={(e) => setForm((p) => ({ ...p, size: e.target.value }))}
          disabled={busy || disabled}
          style={{ width: '100%', padding: '0.45rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '0.875rem', backgroundColor: 'var(--surface)', color: 'inherit' }}
        >
          <option value="" disabled hidden>Size</option>
          {['S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(sz => (
            <option key={sz} value={sz}>{sz}</option>
          ))}
        </select>
      </Field>
      <Field label="Color">
        <Input 
          value={form.color} 
          onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))} 
          disabled={busy || disabled} 
          placeholder="Red" 
        />
      </Field>
      <div className="col-span-2 lg:col-span-1">
        <Field label="SKU">
          <Input 
            value={form.sku} 
            onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))} 
            disabled={busy || disabled} 
            placeholder="SKU" 
          />
        </Field>
      </div>
      <Field label="Price">
        <Input 
          type="number" 
          value={form.price} 
          onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} 
          disabled={busy || disabled} 
          placeholder="৳" 
        />
      </Field>
      <Field label="Compare">
        <Input 
          type="number" 
          value={form.compareAtPrice} 
          onChange={(e) => setForm((p) => ({ ...p, compareAtPrice: e.target.value }))} 
          disabled={busy || disabled} 
          placeholder="৳" 
        />
      </Field>
      <Field label="Stock">
        <InvCell variantId={variant.id} />
      </Field>
      <div className="flex items-end">
        <Button 
          onClick={save} 
          disabled={!hasChanges || busy || disabled}
          style={{ height: '40px', fontSize: '0.75rem', padding: '0 0.75rem', width: '100%' }}
        >
          {busy ? '…' : 'Save'}
        </Button>
      </div>
      {onDelete && (
        <div className="flex items-end">
          <button
            type="button"
            onClick={onDelete}
            disabled={!canDelete || busy || disabled}
            style={{ height: '40px', width: '100%', padding: '0 0.5rem', borderRadius: '0.375rem', border: '1px solid #fee2e2', backgroundColor: '#fef2f2', color: '#991b1b', fontSize: '0.75rem', fontWeight: 600, cursor: (!canDelete || disabled) ? 'not-allowed' : 'pointer', opacity: (!canDelete || disabled) ? 0.5 : 1 }}
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

const EMPTY_NEW = { size: '', color: '', sku: '', price: '', compareAtPrice: '' };

export default function VariantManager({ productId, initialVariants }: VariantManagerProps) {
  const [variants, setVariants] = useState<ProductVariant[]>(initialVariants);
  const [newForm, setNewForm]   = useState(EMPTY_NEW);
  const [adding, setAdding]     = useState(false);
  const [busy, setBusy]         = useState(false);

  const updateRow = (updated: ProductVariant) =>
    setVariants((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));

  const handleDelete = async (variantId: number) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;
    
    setBusy(true);
    try {
      await deleteVariant(variantId);
      setVariants((prev) => prev.filter((v) => v.id !== variantId));
      toast.success('Variant deleted.');
    } catch {
      toast.error('Failed to delete variant.');
    } finally {
      setBusy(false);
    }
  };

  const handleAdd = async () => {
    if (!newForm.size || !newForm.sku || !newForm.price) {
      toast.error('Size, SKU and price are required.'); return;
    }
    if (newForm.compareAtPrice && Number(newForm.compareAtPrice) <= Number(newForm.price)) {
      toast.error('Compare at price must be greater than price.');
      return;
    }
    setBusy(true);
    try {
      const v = await createVariant({
        productId,
        size:  newForm.size,
        color: newForm.color || undefined,
        sku:   newForm.sku,
        price: Number(newForm.price),
        compareAtPrice: newForm.compareAtPrice ? Number(newForm.compareAtPrice) : undefined,
        isActive: true,
      });
      setVariants((prev) => [...prev, v]);
      setNewForm(EMPTY_NEW);
      setAdding(false);
      toast.success('Variant added.');
    } catch { toast.error('Failed to add variant.'); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Existing variants */}
      {variants.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {variants.map((v, i) => (
            <div
              key={v.id}
              style={{ 
                borderTop: i > 0 ? '1px dashed var(--border)' : undefined, 
                paddingTop: i > 0 ? '1rem' : undefined 
              }}
            >
              <VariantRow 
                variant={v} 
                onSaved={updateRow}
                onDelete={() => handleDelete(v.id)}
                canDelete={variants.length > 1}
                disabled={busy}
              />
            </div>
          ))}
        </div>
      )}

      {/* Add variant form */}
      {adding ? (
        <div 
          style={{ 
            border: '2px dashed var(--border)', 
            borderRadius: '0.5rem', 
            padding: '1rem', 
            backgroundColor: 'var(--surface-muted)' 
          }}
        >
          <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-muted)', marginBottom: '0.75rem' }}>
            New Variant
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-[minmax(4rem,1fr)_minmax(5rem,1fr)_minmax(6rem,1fr)_minmax(4rem,1fr)_minmax(4rem,1fr)_auto] items-end gap-2">
            <Field label="Size">
              <select
                value={newForm.size}
                onChange={(e) => setNewForm((p) => ({ ...p, size: e.target.value }))}
                disabled={busy}
                style={{ width: '100%', padding: '0.45rem 0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', fontSize: '0.875rem', backgroundColor: 'var(--surface)', color: 'inherit' }}
              >
                <option value="" disabled hidden>Size</option>
                {['S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map(sz => (
                  <option key={sz} value={sz}>{sz}</option>
                ))}
              </select>
            </Field>
            <Field label="Color">
              <Input 
                value={newForm.color} 
                onChange={(e) => setNewForm((p) => ({ ...p, color: e.target.value }))} 
                disabled={busy} 
                placeholder="Red" 
              />
            </Field>
            <div className="col-span-2 lg:col-span-1">
              <Field label="SKU">
                <Input 
                  value={newForm.sku} 
                  onChange={(e) => setNewForm((p) => ({ ...p, sku: e.target.value }))} 
                  disabled={busy} 
                  placeholder="SKU" 
                />
              </Field>
            </div>
            <Field label="Price">
              <Input 
                type="number" 
                value={newForm.price} 
                onChange={(e) => setNewForm((p) => ({ ...p, price: e.target.value }))} 
                disabled={busy} 
                placeholder="৳" 
              />
            </Field>
            <Field label="Compare">
              <Input 
                type="number" 
                value={newForm.compareAtPrice} 
                onChange={(e) => setNewForm((p) => ({ ...p, compareAtPrice: e.target.value }))} 
                disabled={busy} 
                placeholder="৳" 
              />
            </Field>
            <div className="flex items-end gap-2 col-span-2 lg:col-span-1">
              <Button onClick={handleAdd} disabled={busy} style={{ height: '40px', fontSize: '0.75rem', flex: 1 }}>
                {busy ? '…' : 'Add Variant'}
              </Button>
              <Button variant="outline" onClick={() => setAdding(false)} disabled={busy} style={{ height: '40px', fontSize: '0.75rem', flex: 1 }}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{
            alignSelf:      'flex-start',
            background:     'none',
            border:         '2px dashed var(--border)',
            borderRadius:   '0.5rem',
            padding:        '0.5rem 1.25rem',
            fontSize:       '0.875rem',
            fontWeight:     600,
            cursor:         'pointer',
            color:          'var(--on-surface-muted)',
          }}
        >
          + Add Variant
        </button>
      )}
    </div>
  );
}
