'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { FiTrash2 } from 'react-icons/fi';
import { updateCartItem } from '@/application/cart/updateCartItem';
import { removeFromCart } from '@/application/cart/removeFromCart';
import type { Cart, CartItem } from '@/domain/cart/cart.entity';

const fmt = (n: number) => `৳${Number(n || 0).toFixed(0)}`;

// ─── Qty Stepper ──────────────────────────────────────────────────────────────

function QttStepper({
  qty,
  max,
  loading,
  onChange,
}: {
  qty:      number;
  max:      number;
  loading:  boolean;
  onChange: (n: number) => void;
}) {
  const btnBase: React.CSSProperties = {
    width: '2.1rem', height: '2.1rem',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '1.15rem', lineHeight: 1, transition: 'opacity 0.15s',
  };
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      border: '1.5px solid var(--border)',
      overflow: 'hidden', backgroundColor: 'var(--surface)',
    }}>
      <button
        onClick={() => onChange(qty - 1)}
        disabled={loading || qty <= 1}
        style={{ ...btnBase, opacity: qty <= 1 ? 0.3 : 1 }}
      >−</button>
      <span style={{ minWidth: '1.75rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: 700 }}>
        {qty}
      </span>
      <button
        onClick={() => onChange(qty + 1)}
        disabled={loading || qty >= max}
        style={{ ...btnBase, opacity: qty >= max ? 0.3 : 1 }}
      >+</button>
    </div>
  );
}

// ─── Cart Item Card ───────────────────────────────────────────────────────────

function MobileCartItem({ item, onUpdate }: { item: CartItem; onUpdate: () => void }) {
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
        display:         'flex',
        gap:             '0.875rem',
        backgroundColor: 'var(--surface)',
        padding:         '0.875rem',
        border:          '1px solid var(--border)',
        opacity:         loading ? 0.5 : 1,
        transition:      'opacity 0.2s',
      }}
    >
      {/* Image */}
      <Link href={`/products/${item.variantSku}`} style={{ flexShrink: 0 }}>
        <div style={{
          width: '96px', height: '128px',
          overflow: 'hidden', backgroundColor: 'var(--surface-variant)', position: 'relative',
        }}>
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" sizes="96px" />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--on-surface-muted)' }}>
              No image
            </div>
          )}
        </div>
      </Link>

      {/* Details */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Link href={`/products/${item.variantSku}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <p style={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.35, marginBottom: '0.2rem' }}>
            {item.productName}
          </p>
        </Link>

        <p style={{ fontSize: '0.775rem', color: 'var(--on-surface-muted)' }}>
          {item.variantSize}{item.variantColor ? ` · ${item.variantColor}` : ''}
        </p>

        {item.unitPrice > 0 && (
          <p style={{ fontSize: '0.775rem', color: 'var(--on-surface-muted)', marginTop: '0.15rem' }}>
            {fmt(item.unitPrice)} each
          </p>
        )}

        {/* Bottom row: stepper + price + remove */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.625rem' }}>
          <QttStepper qty={qty} max={item.availableStock} loading={loading} onChange={changeQty} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--brand-gold)' }}>
              {fmt(item.lineTotal)}
            </p>
            <button
              onClick={handleRemove}
              disabled={loading}
              aria-label="Remove item"
              style={{
                width: '2rem', height: '2rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'color-mix(in srgb, var(--destructive) 9%, transparent)', border: 'none',
                cursor: 'pointer', color: 'var(--destructive)', flexShrink: 0,
              }}
            >
              <FiTrash2 size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function MobileCartSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            display: 'flex', gap: '0.875rem',
            backgroundColor: 'var(--surface)',
            padding: '0.875rem', border: '1px solid var(--border)',
          }}
        >
          <Skeleton style={{ width: '96px', height: '128px', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.25rem' }}>
            <Skeleton style={{ height: '0.875rem', width: '70%' }} />
            <Skeleton style={{ height: '0.75rem', width: '40%' }} />
            <Skeleton style={{ height: '0.75rem', width: '25%' }} />
            <Skeleton style={{ height: '2.1rem', width: '7.5rem', marginTop: 'auto' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Sticky Checkout Bar ──────────────────────────────────────────────────────

function CheckoutBar({ cart }: { cart: Cart }) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      backgroundColor: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      boxShadow: '0 -6px 24px rgba(0,0,0,0.12)',
      padding: '0.875rem 1.25rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
    }}>
      <div>
        <p style={{ fontSize: '0.65rem', color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.1rem' }}>
          {cart.totalItems} item{cart.totalItems !== 1 ? 's' : ''}
        </p>
        <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-gold)', lineHeight: 1 }}>
          {fmt(cart.subtotal)}
        </p>
      </div>
      <Link
        href="/checkout"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0.75rem 2rem',
          backgroundColor: 'var(--primary)', color: 'var(--on-primary)',
          fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.08em',
          textTransform: 'uppercase', textDecoration: 'none', whiteSpace: 'nowrap',
          boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
        }}
      >
        Checkout →
      </Link>
    </div>
  );
}

// ─── MobileCartView ───────────────────────────────────────────────────────────

interface MobileCartViewProps {
  cart:        Cart | null;
  loading:     boolean;
  clearing:    boolean;
  onUpdate:    () => void;
}

export default function MobileCartView({
  cart,
  loading,
  clearing,
  onUpdate,
}: MobileCartViewProps) {
  if (loading) {
    return (
      <div style={{ padding: '0 1rem 6rem' }}>
        <div style={{ padding: '0.75rem 1rem 1rem' }}>
          <Skeleton style={{ height: '1.25rem', width: '6rem' }} />
        </div>
        <div style={{ padding: '0 1rem' }}>
          <MobileCartSkeleton />
        </div>
      </div>
    );
  }

  if (!cart || cart.totalItems === 0) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', padding: '2rem', gap: '1.25rem', textAlign: 'center',
      }}>
        <div style={{ fontSize: '4rem', lineHeight: 1 }}>🛒</div>
        <div>
          <p style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.4rem' }}>Your cart is empty</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-muted)' }}>
            Looks like you haven&apos;t added anything yet.
          </p>
        </div>
        <Link
          href="/products"
          style={{
            padding: '0.75rem 2.25rem',
            backgroundColor: 'var(--primary)', color: 'var(--on-primary)',
            fontWeight: 700, fontSize: '0.875rem', letterSpacing: '0.08em',
            textTransform: 'uppercase', textDecoration: 'none',
          }}
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <>
      <div style={{ padding: '0 1rem 6rem' }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.75rem 0 1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <p style={{ fontWeight: 700, fontSize: '1.05rem' }}>My Cart</p>
            <span style={{
              backgroundColor: 'var(--primary)', color: 'var(--on-primary)',
              fontSize: '0.7rem', fontWeight: 700,
              padding: '0.1rem 0.55rem', lineHeight: 1.7,
            }}>
              {cart.totalItems}
            </span>
          </div>
        </div>

        {/* Item cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {cart.items.map((item) => (
            <MobileCartItem key={item.id} item={item} onUpdate={onUpdate} />
          ))}
        </div>

        {/* Order summary */}
        <div style={{
          marginTop: '1.25rem',
          border: '1px solid var(--border)', backgroundColor: 'var(--surface)',
          padding: '1rem 1.25rem',
        }}>
          <p style={{
            fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.12em', color: 'var(--on-surface-muted)', marginBottom: '0.75rem',
          }}>
            Order Summary
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--on-surface-muted)' }}>Subtotal ({cart.totalItems} items)</span>
              <span style={{ fontWeight: 600 }}>{fmt(cart.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--on-surface-muted)' }}>Delivery</span>
              <span style={{ color: 'var(--on-surface-muted)', fontSize: '0.78rem' }}>Calculated at checkout</span>
            </div>
          </div>
          <div style={{
            borderTop: '1px solid var(--border)', marginTop: '0.75rem', paddingTop: '0.75rem',
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span style={{ fontWeight: 700 }}>Total</span>
            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--brand-gold)' }}>
              {fmt(cart.subtotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Sticky checkout bar */}
      <CheckoutBar cart={cart} />
    </>
  );
}
