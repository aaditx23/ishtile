'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  updateVariant,
  createVariant,
  getInventory,
  updateInventory,
} from '@/application/product/adminProduct';
import type { ProductVariant } from '@/domain/product/product.entity';
import type { InventoryDto } from '@/shared/types/api.types';

interface VariantManagerProps {
  productId:       number;
  initialVariants: ProductVariant[];
}

const cellStyle: React.CSSProperties = { padding: '0.5rem 0.625rem', fontSize: '0.78rem' };

function InvCell({ variantId }: { variantId: number }) {
  const [inv, setInv]   = useState<InventoryDto | null>(null);
  const [qty, setQty]   = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setInv(null);
    setBusy(true);
    try {
      const data = await getInventory(variantId);
      setInv(data);
      setQty(String(data.quantity));
    } catch { toast.error('Could not load inventory.'); }
    finally { setBusy(false); }
  };

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
      <button
        onClick={load}
        disabled={busy}
        style={{ fontSize: '0.7rem', color: 'var(--brand-gold)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
      >
        {busy ? '…' : 'Load inv'}
      </button>
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
      <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-muted)' }}>/ avail: {inv.availableQuantity}</span>
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
}: {
  variant:  ProductVariant;
  onSaved:  (v: ProductVariant) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm]       = useState({
    size:  variant.size,
    color: variant.color ?? '',
    sku:   variant.sku,
    price: String(variant.price),
    isActive: variant.isActive,
  });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      const updated = await updateVariant(variant.id, {
        size:     form.size,
        color:    form.color || undefined,
        sku:      form.sku,
        price:    Number(form.price),
        isActive: form.isActive,
      });
      onSaved(updated);
      setEditing(false);
      toast.success('Variant saved.');
    } catch { toast.error('Failed to save variant.'); }
    finally { setBusy(false); }
  };

  if (editing) {
    return (
      <tr>
        <td colSpan={6} style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--surface-muted)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.625rem', alignItems: 'end' }}>
            {(['size', 'color', 'sku', 'price'] as const).map((k) => (
              <div key={k}>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-muted)', marginBottom: '0.2rem' }}>{k}</p>
                <Input
                  value={form[k]}
                  placeholder={k}
                  onChange={(e) => setForm((p) => ({ ...p, [k]: e.target.value }))}
                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.78rem' }}
                  disabled={busy}
                  type={k === 'price' ? 'number' : 'text'}
                />
              </div>
            ))}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.78rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} disabled={busy} />
              Active
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button onClick={save} disabled={busy} style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', backgroundColor: 'var(--brand-dark)', color: 'var(--on-primary)' }}>
                {busy ? '…' : 'Save'}
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)} style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}>Cancel</Button>
            </div>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr style={{ borderBottom: '1px solid var(--border)' }}>
      <td style={cellStyle}>{variant.size}</td>
      <td style={cellStyle}>{variant.color ?? '—'}</td>
      <td style={{ ...cellStyle, fontFamily: 'monospace', fontSize: '0.7rem' }}>{variant.sku}</td>
      <td style={{ ...cellStyle, fontWeight: 700 }}>৳{variant.price.toFixed(0)}</td>
      <td style={cellStyle}><InvCell variantId={variant.id} /></td>
      <td style={cellStyle}>
        <button
          onClick={() => setEditing(true)}
          style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-gold)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Edit
        </button>
      </td>
    </tr>
  );
}

const EMPTY_NEW = { size: '', color: '', sku: '', price: '' };

export default function VariantManager({ productId, initialVariants }: VariantManagerProps) {
  const [variants, setVariants] = useState<ProductVariant[]>(initialVariants);
  const [newForm, setNewForm]   = useState(EMPTY_NEW);
  const [adding, setAdding]     = useState(false);
  const [busy, setBusy]         = useState(false);

  const updateRow = (updated: ProductVariant) =>
    setVariants((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));

  const handleAdd = async () => {
    if (!newForm.size || !newForm.sku || !newForm.price) {
      toast.error('Size, SKU and price are required.'); return;
    }
    setBusy(true);
    try {
      const v = await createVariant({
        productId,
        size:  newForm.size,
        color: newForm.color || undefined,
        sku:   newForm.sku,
        price: Number(newForm.price),
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
        <div style={{ border: '1px solid var(--border)', borderRadius: '0.5rem', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--surface-muted)' }}>
                {['Size', 'Color', 'SKU', 'Price', 'Inventory', ''].map((h) => (
                  <th key={h} style={{ ...cellStyle, fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--on-surface-muted)', textAlign: 'left' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <VariantRow key={v.id} variant={v} onSaved={updateRow} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add variant form */}
      {adding ? (
        <div style={{ border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.875rem', backgroundColor: 'var(--surface-muted)' }}>
          <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-muted)', marginBottom: '0.625rem' }}>New Variant</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.625rem', alignItems: 'end' }}>
            {(['size', 'color', 'sku', 'price'] as const).map((k) => (
              <div key={k}>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--on-surface-muted)', marginBottom: '0.2rem' }}>{k}</p>
                <Input
                  value={newForm[k]}
                  placeholder={k}
                  onChange={(e) => setNewForm((p) => ({ ...p, [k]: e.target.value }))}
                  style={{ padding: '0.3rem 0.5rem', fontSize: '0.78rem' }}
                  disabled={busy}
                  type={k === 'price' ? 'number' : 'text'}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
              <Button onClick={handleAdd} disabled={busy} style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', backgroundColor: 'var(--brand-dark)', color: 'var(--on-primary)' }}>
                {busy ? '…' : 'Add'}
              </Button>
              <Button variant="outline" onClick={() => setAdding(false)} style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}>Cancel</Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          style={{
            alignSelf:      'flex-start',
            background:     'none',
            border:         '1px dashed var(--border)',
            borderRadius:   '0.5rem',
            padding:        '0.4rem 1rem',
            fontSize:       '0.78rem',
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
