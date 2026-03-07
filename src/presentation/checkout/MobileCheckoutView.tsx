'use client';

import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import ShippingForm, { type ShippingFields } from './components/ShippingForm';
import OrderReview from './components/OrderReview';
import PromoInput from './components/PromoInput';
import AddressPicker from './components/AddressPicker';
import type { Cart } from '@/domain/cart/cart.entity';
import type { PromoValidationDto } from '@/shared/types/api.types';

const fmt = (n: number) => `৳${Number(n || 0).toFixed(0)}`;

// ─── Section card ─────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: 'var(--surface)',
      border:          '1px solid var(--border)',
      borderRadius:    '0.875rem',
      padding:         '1rem 1.25rem',
    }}>
      <p style={{
        fontSize:      '0.65rem',
        fontWeight:    700,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        color:         'var(--on-surface-muted)',
        marginBottom:  '0.875rem',
      }}>
        {title}
      </p>
      {children}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function MobileCheckoutSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0 1rem' }}>
      {[120, 200, 60, 160].map((h, i) => (
        <Skeleton key={i} style={{ width: '100%', height: `${h}px`, borderRadius: '0.875rem' }} />
      ))}
    </div>
  );
}

// ─── Sticky Place-Order Bar ────────────────────────────────────────────────────

function PlaceOrderBar({
  total,
  canSubmit,
  submitting,
}: {
  total:      number;
  canSubmit:  boolean;
  submitting: boolean;
}) {
  return (
    <div style={{
      position:        'fixed',
      bottom:          0, left: 0, right: 0, zIndex: 50,
      backgroundColor: 'var(--surface)',
      borderTop:       '1px solid var(--border)',
      boxShadow:       '0 -6px 24px rgba(0,0,0,0.12)',
      padding:         '0.875rem 1.25rem',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'space-between',
      gap:             '1rem',
    }}>
      <div>
        <p style={{ fontSize: '0.65rem', color: 'var(--on-surface-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.1rem' }}>
          Total
        </p>
        <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-gold)', lineHeight: 1 }}>
          {fmt(total)}
        </p>
      </div>
      <button
        type="submit"
        disabled={!canSubmit}
        style={{
          padding:         '0.75rem 2rem',
          borderRadius:    '9999px',
          border:          'none',
          backgroundColor: canSubmit ? 'var(--primary)' : 'var(--border)',
          color:           canSubmit ? 'var(--on-primary)' : 'var(--on-surface-muted)',
          fontWeight:      700,
          fontSize:        '0.875rem',
          letterSpacing:   '0.08em',
          textTransform:   'uppercase',
          cursor:          canSubmit ? 'pointer' : 'not-allowed',
          whiteSpace:      'nowrap',
          transition:      'background-color 0.15s, color 0.15s',
          boxShadow:       canSubmit ? '0 4px 14px rgba(0,0,0,0.18)' : 'none',
        }}
      >
        {submitting ? 'Placing…' : 'Place Order'}
      </button>
    </div>
  );
}

// ─── MobileCheckoutView ───────────────────────────────────────────────────────

interface MobileCheckoutViewProps {
  cart:           Cart | null;
  cartLoading:    boolean;
  fields:         ShippingFields;
  showNewForm:    boolean;
  promoCode:      string;
  promoResult:    PromoValidationDto | null;
  submitting:     boolean;
  codConfirmed:   boolean;
  canSubmit:      boolean;
  patchFields:    (partial: Partial<ShippingFields>) => void;
  handleAddressPick: (partial: Partial<ShippingFields> | null) => void;
  handlePromoApply:  (result: PromoValidationDto, code: string) => void;
  handlePromoRemove: () => void;
  setCodConfirmed:   (v: boolean) => void;
  onSubmit:          (e: React.FormEvent) => void;
}

export default function MobileCheckoutView({
  cart,
  cartLoading,
  fields,
  showNewForm,
  promoCode,
  promoResult,
  submitting,
  codConfirmed,
  canSubmit,
  patchFields,
  handleAddressPick,
  handlePromoApply,
  handlePromoRemove,
  setCodConfirmed,
  onSubmit,
}: MobileCheckoutViewProps) {
  const promoDiscount = promoResult?.discountAmount ?? 0;
  const total = (cart?.subtotal ?? 0) - promoDiscount;

  if (cartLoading) {
    return (
      <div style={{ padding: '0 0 6rem' }}>
        <div style={{ padding: '0.75rem 1rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Skeleton style={{ width: '1.5rem', height: '1.5rem', borderRadius: '50%' }} />
          <Skeleton style={{ width: '6rem', height: '1.25rem' }} />
        </div>
        <MobileCheckoutSkeleton />
      </div>
    );
  }

  if (!cart) return null;

  return (
    <form onSubmit={onSubmit} style={{ paddingBottom: '6rem' }}>
      {/* Page header */}
      <div style={{
        display:     'flex',
        alignItems:  'center',
        gap:         '0.75rem',
        padding:     '0.75rem 1rem 1rem',
      }}>
        <Link
          href="/cart"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '2rem', height: '2rem', borderRadius: '50%',
            border: '1px solid var(--border)', backgroundColor: 'var(--surface)',
            color: 'var(--on-surface)', textDecoration: 'none', fontSize: '1rem',
            flexShrink: 0,
          }}
          aria-label="Back to cart"
        >
          ←
        </Link>
        <p style={{ fontWeight: 700, fontSize: '1.05rem' }}>Checkout</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0 1rem' }}>

        {/* Delivery address */}
        <Section title="Delivery Address">
          <AddressPicker onSelect={handleAddressPick} disabled={submitting} />
          {showNewForm && (
            <div style={{ marginTop: showNewForm ? '0.875rem' : 0 }}>
              <ShippingForm values={fields} onChange={patchFields} disabled={submitting} columns={1} />
            </div>
          )}
        </Section>

        {/* Order summary */}
        <Section title="Order Summary">
          <OrderReview cart={cart} promoDiscount={promoDiscount} />
        </Section>

        {/* Promo */}
        <Section title="Promo Code">
          <PromoInput
            subtotal={cart.subtotal}
            onApply={handlePromoApply}
            onRemove={handlePromoRemove}
            appliedCode={promoCode || undefined}
            discount={promoResult?.discountAmount}
          />
        </Section>

        {/* Payment / COD confirmation */}
        <Section title="Payment Method">
          <div style={{
            display:         'flex',
            alignItems:      'center',
            gap:             '0.75rem',
            padding:         '0.75rem 1rem',
            borderRadius:    '0.625rem',
            border:          `1.5px solid ${codConfirmed ? 'var(--primary)' : 'var(--border)'}`,
            backgroundColor: codConfirmed ? 'color-mix(in srgb, var(--primary) 6%, transparent)' : 'transparent',
            cursor:          'pointer',
            transition:      'border-color 0.15s, background-color 0.15s',
          }}
            onClick={() => !submitting && setCodConfirmed(!codConfirmed)}
          >
            <input
              type="checkbox"
              checked={codConfirmed}
              onChange={(e) => setCodConfirmed(e.target.checked)}
              disabled={submitting}
              style={{ width: '1.1rem', height: '1.1rem', accentColor: 'var(--primary)', cursor: 'pointer', flexShrink: 0 }}
            />
            <div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.15rem' }}>Cash on Delivery</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)', lineHeight: 1.4 }}>
                Have the payment ready when your order arrives.
              </p>
            </div>
          </div>
        </Section>

      </div>

      {/* Sticky bottom bar */}
      <PlaceOrderBar total={total} canSubmit={!!canSubmit} submitting={submitting} />
    </form>
  );
}
