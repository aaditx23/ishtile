'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FiTrash2 } from 'react-icons/fi';
import { updateCartItem } from '@/application/cart/updateCartItem';
import { removeFromCart } from '@/application/cart/removeFromCart';
import type { CartItem } from '@/domain/cart/cart.entity';

interface CartItemRowProps {
  item: CartItem;
  onUpdate: () => void; // tells parent to refresh cart
}

const fmt = (n: number) => `৳${Number(n || 0).toFixed(0)}`;

export default function CartItemRow({ item, onUpdate }: CartItemRowProps) {
  const [qty, setQty]         = useState(item.quantity);
  const [loading, setLoading] = useState(false);

  const changeQty = async (newQty: number) => {
    if (newQty < 1 || newQty > item.availableStock) return;
    setLoading(true);
    try {
      await updateCartItem(item.id, newQty);
      setQty(newQty);
      onUpdate();
    } catch {
      toast.error('Could not update quantity.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    try {
      await removeFromCart(item.id);
      toast.success('Item removed.');
      onUpdate();
    } catch {
      toast.error('Could not remove item.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display:      'flex',
        gap:          '0.875rem',
        padding:      '1rem 0',
        borderBottom: '1px solid var(--border)',
        alignItems:   'flex-start',
        opacity:      loading ? 0.6 : 1,
        transition:   'opacity 0.2s',
      }}
    >
      {/* Image */}
      <Link href={`/products/${item.variantSku}`} style={{ flexShrink: 0 }}>
        <div style={{ width: '88px', height: '117px', borderRadius: '0.5rem', overflow: 'hidden', backgroundColor: 'var(--surface-variant)', position: 'relative' }}>
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" sizes="88px" />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-muted)', fontSize: '0.7rem' }}>
              No image
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.3rem', minWidth: 0 }}>
        {/* Name + price row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
          <p style={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.3, flex: 1 }}>{item.productName}</p>
          <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--brand-gold)', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {fmt(item.lineTotal)}
          </p>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-muted)' }}>
          {item.variantSize}{item.variantColor ? ` / ${item.variantColor}` : ''}
        </p>
        {item.unitPrice > 0 && (
          <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)' }}>
            {fmt(item.unitPrice)} each
          </p>
        )}

        {/* Qty + remove */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
          <Button variant="outline" size="sm" style={{ width: '2rem', height: '2rem', padding: 0 }} disabled={loading || qty <= 1} onClick={() => changeQty(qty - 1)}>−</Button>
          <span style={{ minWidth: '1.5rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 600 }}>{qty}</span>
          <Button variant="outline" size="sm" style={{ width: '2rem', height: '2rem', padding: 0 }} disabled={loading || qty >= item.availableStock} onClick={() => changeQty(qty + 1)}>+</Button>
          <button onClick={handleRemove} disabled={loading} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-muted)', display: 'flex', alignItems: 'center', padding: '0.25rem' }} aria-label="Remove item">
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
