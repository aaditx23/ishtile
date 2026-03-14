'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';

import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import ShippingForm, { type ShippingFields } from './components/ShippingForm';
import OrderReview from './components/OrderReview';
import PromoInput from './components/PromoInput';
import AddressPicker from './components/AddressPicker';
import MobileCheckoutView from './MobileCheckoutView';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import { getCart } from '@/application/cart/getCart';
import { createOrder } from '@/application/checkout/createOrder';
import { getCheckoutShippingCost } from '@/application/checkout/getCheckoutShippingCost';
import type { Cart } from '@/domain/cart/cart.entity';
import type { PromoValidationDto } from '@/shared/types/api.types';

const EMPTY_FIELDS: ShippingFields = {
  name:       '',
  phone:      '',
  address:    '',
  cityName:   '',
  cityId:     null,
  zoneId:     null,
  areaId:     null,
  postalCode: '',
  notes:      '',
};

export default function CheckoutView() {
  const router = useRouter();

  const [cart, setCart]                 = useState<Cart | null>(null);
  const [cartLoading, setCartLoading]   = useState(true);
  const [fields, setFields]             = useState<ShippingFields>(EMPTY_FIELDS);
  const [promoCode, setPromoCode]       = useState('');
  const [promoResult, setPromoResult]   = useState<PromoValidationDto | null>(null);
  const [submitting, setSubmitting]     = useState(false);
  const [codConfirmed, setCodConfirmed] = useState(false);
  const [showNewForm, setShowNewForm]   = useState(false);
  const [shippingCost, setShippingCost] = useState(0);

  // Fetch shipping quote from backend whenever city changes.
  useEffect(() => {
    if (!fields.cityName) {
      setShippingCost(0);
      return;
    }

    let cancelled = false;
    const loadShippingCost = async () => {
      try {
        const cost = await getCheckoutShippingCost(fields.cityName);
        if (!cancelled) setShippingCost(cost);
      } catch {
        if (!cancelled) setShippingCost(0);
      }
    };

    void loadShippingCost();
    return () => {
      cancelled = true;
    };
  }, [fields.cityName]);

  const fetchCart = useCallback(async () => {
    setCartLoading(true);
    try {
      const c = await getCart();
      if (c.totalItems === 0) { router.replace('/cart'); return; }
      setCart(c);
    } catch {
      toast.error('Could not load your cart.');
    } finally {
      setCartLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const handlePromoApply = (result: PromoValidationDto, code: string) => {
    setPromoResult(result);
    setPromoCode(code);
    toast.success(`Promo applied — ৳${result.discountAmount.toFixed(0)} off`);
  };

  const handlePromoRemove = () => { setPromoResult(null); setPromoCode(''); };

  const handleAddressPick = (partial: Partial<ShippingFields> | null) => {
    if (partial === null) {
      // 'new address' selected
      setShowNewForm(true);
      setFields(EMPTY_FIELDS);
    } else {
      setShowNewForm(false);
      setFields((prev) => ({ ...prev, ...partial }));
    }
  };

  const patchFields = (partial: Partial<ShippingFields>) =>
    setFields((prev) => ({ ...prev, ...partial }));

  const canSubmit =
    fields.name.trim() &&
    fields.phone.trim() &&
    fields.address.trim() &&
    fields.cityId != null &&
    fields.zoneId != null &&
    fields.areaId != null &&
    codConfirmed &&
    !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const order = await createOrder({
        shippingName:        fields.name.trim(),
        shippingPhone:       fields.phone.trim(),
        shippingAddress:     fields.address.trim(),
        shippingAddressLine: fields.address.trim(),
        shippingCity:        fields.cityName,
        shippingCityId:      fields.cityId!,
        shippingZoneId:      fields.zoneId!,
        shippingAreaId:      fields.areaId!,
        ...(fields.postalCode.trim() ? { shippingPostalCode: fields.postalCode.trim() } : {}),
        paymentMethod:       'cod',
        deliveryMode:        'manual',
        ...(promoCode ? { promoCode } : {}),
        ...(fields.notes.trim() ? { customerNotes: fields.notes.trim() } : {}),
      });
      toast.success('Order placed successfully!');
      router.push(`/orders/${order.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  const mobileProps = {
    cart,
    cartLoading,
    fields,
    showNewForm,
    promoCode,
    promoResult,
    submitting,
    codConfirmed,
    canSubmit: !!canSubmit,
    shippingCost,
    patchFields,
    handleAddressPick,
    handlePromoApply,
    handlePromoRemove,
    setCodConfirmed,
    onSubmit: handleSubmit,
  };

  return (
    <ShopLayout>
      {/* ── Mobile ──────────────────────────────────────────────── */}
      <div className="block lg:hidden">
        <MobileCheckoutView {...mobileProps} />
      </div>

      {/* ── Desktop ─────────────────────────────────────────────── */}
      <div className="hidden lg:block">
      <div
        style={{
          maxWidth:   '64rem',
          margin:     '0 auto',
          padding:    '2rem 1.25rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
          <Button asChild variant="ghost" size="sm">
            <Link href="/cart">← Cart</Link>
          </Button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Checkout</h1>
        </div>

        {cartLoading ? (
          <CheckoutSkeleton />
        ) : cart ? (
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display:    'grid',
                gridTemplateColumns: 'clamp(280px,55%,640px) 1fr',
                gap:        '2rem',
                alignItems: 'start',
              }}
            >
              {/* ── Left column: shipping + promo ─────────────── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                {/* Shipping */}
                <Section title="Shipping Information">
                  <AddressPicker onSelect={handleAddressPick} disabled={submitting} />
                  {showNewForm && (
                    <div style={{ marginTop: '0.875rem' }}>
                      <ShippingForm values={fields} onChange={patchFields} disabled={submitting} />
                    </div>
                  )}
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
              </div>

              {/* ── Right column: order review + place order ───── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <Section title="Order Summary">
                  <OrderReview
                    cart={cart}
                    promoDiscount={promoResult?.discountAmount ?? 0}
                    shippingCost={shippingCost}
                  />
                </Section>

                {/* COD confirmation */}
                <Section title="Payment">
                  <label
                    style={{
                      display:     'flex',
                      alignItems:  'center',
                      gap:         '0.625rem',
                      cursor:      'pointer',
                      fontSize:    '0.875rem',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={codConfirmed}
                      onChange={(e) => setCodConfirmed(e.target.checked)}
                      disabled={submitting}
                      style={{ width: '1rem', height: '1rem', accentColor: 'var(--brand-gold)', cursor: 'pointer' }}
                    />
                    Pay on delivery (COD) — I understand that I must have the payment ready when the order arrives.
                  </label>
                </Section>

                <Button
                  type="submit"
                  disabled={!canSubmit}
                  style={{
                    width:      '100%',
                    padding:    '0.75rem',
                    fontSize:   '0.9rem',
                    fontWeight: 700,
                  }}
                >
                  {submitting ? 'Placing Order…' : 'Place Order'}
                </Button>
              </div>
            </div>
          </form>
        ) : null}
      </div>
      </div>
    </ShopLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        border:       '1px solid var(--border)',
        padding:      '1.25rem',
        backgroundColor: 'var(--surface)',
      }}
    >
      <h2
        style={{
          fontSize:      '0.7rem',
          fontWeight:    700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color:         'var(--on-surface-muted)',
          marginBottom:  '1rem',
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[80, 52, 52, 52, 52].map((h, i) => (
          <Skeleton key={i} style={{ width: '100%', height: `${h}px` }} />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {[160, 80].map((h, i) => (
          <Skeleton key={i} style={{ width: '100%', height: `${h}px` }} />
        ))}
      </div>
    </div>
  );
}
