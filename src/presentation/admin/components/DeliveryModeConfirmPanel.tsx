'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { confirmOrderWithDelivery } from '@/application/order/confirmOrderWithDelivery';
import type { Order } from '@/domain/order/order.entity';

type DeliveryMode  = 'manual' | 'pathao';
type DeliveryType  = 'Normal Delivery' | 'Same Day Delivery';

interface DeliveryModeConfirmPanelProps {
  order:              Order;
  /** Called after a successful confirm/upgrade. No argument needed — caller reloads the order. */
  onOrderConfirmed:   () => void;
}

export default function DeliveryModeConfirmPanel({ order, onOrderConfirmed }: DeliveryModeConfirmPanelProps) {
  const totalQty = order.items?.reduce((s, i) => s + i.quantity, 0) ?? 1;

  // Initialise to the current deliveryMode so the active button is correct
  const [mode, setMode]                       = useState<DeliveryMode>(order.deliveryMode ?? 'manual');
  const [itemWeight, setItemWeight]           = useState<string>('0.5');
  const [itemQty, setItemQty]                 = useState<string>(String(totalQty));
  const [deliveryType, setDeliveryType]       = useState<DeliveryType>('Normal Delivery');
  const [amountToCollect, setAmountToCollect] = useState<string>(String(order.total));
  const [specialInstr, setSpecialInstr]       = useState<string>('');
  const [shippingCost, setShippingCost]       = useState<string>('');
  const [saving, setSaving]                   = useState(false);

  const hasPathaoLocation = !!(order.shippingCityId && order.shippingZoneId && order.shippingAreaId);

  const handleConfirm = async () => {
    setSaving(true);
    try {
      if (mode === 'pathao' && !hasPathaoLocation) {
        toast.error('Order is missing city/zone/area — required for Pathao');
        return;
      }

      await confirmOrderWithDelivery(order.id, {
        deliveryMode:    mode,
        ...(mode === 'pathao' ? {
          itemWeight:           parseFloat(itemWeight) || 0.5,
          itemQuantity:         parseInt(itemQty, 10) || totalQty,
          deliveryType,
          amountToCollect:      parseFloat(amountToCollect) || order.total,
          specialInstructions:  specialInstr.trim() || undefined,
        } : {
          shippingCost: shippingCost ? parseFloat(shippingCost) : undefined,
        }),
      });

      toast.success(mode === 'pathao' ? 'Pathao courier booked' : 'Order confirmed — manual delivery');
      onOrderConfirmed();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to confirm order');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width:           '100%',
    padding:         '0.45rem 0.75rem',
    borderRadius:    '0.5rem',
    border:          '1px solid var(--border)',
    fontSize:        '0.82rem',
    backgroundColor: 'var(--surface)',
    color:           'inherit',
    fontFamily:      'inherit',
  };

  const labelStyle: React.CSSProperties = {
    fontSize:   '0.72rem',
    fontWeight: 600,
    color:      'var(--on-surface-muted)',
    marginBottom: '0.25rem',
    display:    'block',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Mode selector */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        {(['manual', 'pathao'] as DeliveryMode[]).map((m) => {
          const active    = mode === m;
          // Manual is locked once Pathao has been assigned
          const locked    = m === 'manual' && order.deliveryMode === 'pathao';
          return (
            <button
              key={m}
              onClick={() => !locked && setMode(m)}
              disabled={saving || locked}
              title={locked ? 'Cannot revert to manual once Pathao is assigned' : undefined}
              style={{
                flex:            1,
                padding:         '0.55rem',
                borderRadius:    '0.5rem',
                border:          active ? '2px solid var(--brand-gold)' : '1px solid var(--border)',
                backgroundColor: active ? 'var(--brand-gold)' : 'transparent',
                color:           active ? '#fff' : locked ? 'var(--on-surface-muted)' : 'var(--on-surface)',
                fontWeight:      active ? 700 : 500,
                fontSize:        '0.82rem',
                cursor:          locked ? 'not-allowed' : 'pointer',
                textTransform:   'capitalize',
                opacity:         locked ? 0.45 : 1,
              }}
            >
              {m === 'manual' ? '🚚 Manual' : '📦 Pathao Courier'}
            </button>
          );
        })}
      </div>

      {/* Manual: optional shipping cost override */}
      {mode === 'manual' && (
        <div>
          <label style={labelStyle}>Shipping Cost Override (optional)</label>
          <input
            type="number"
            min="0"
            step="any"
            placeholder={`Default: ৳${order.shippingCost}`}
            value={shippingCost}
            onChange={(e) => setShippingCost(e.target.value)}
            disabled={saving}
            style={inputStyle}
          />
        </div>
      )}

      {/* Pathao: full form */}
      {mode === 'pathao' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {!hasPathaoLocation && (
            <p style={{
              padding:         '0.6rem 0.75rem',
              borderRadius:    '0.5rem',
              backgroundColor: '#fee2e2',
              color:           '#b91c1c',
              fontSize:        '0.78rem',
              fontWeight:      600,
            }}>
              ⚠ Order has no delivery city/zone/area — please update the order before using Pathao.
            </p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div>
              <label style={labelStyle}>Item Weight (kg) *</label>
              <input
                type="number"
                min="0.5"
                step="0.1"
                value={itemWeight}
                onChange={(e) => setItemWeight(e.target.value)}
                disabled={saving}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Item Quantity</label>
              <input
                type="number"
                min="1"
                step="1"
                value={itemQty}
                onChange={(e) => setItemQty(e.target.value)}
                disabled={saving}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Delivery Type</label>
            <select
              value={deliveryType}
              onChange={(e) => setDeliveryType(e.target.value as DeliveryType)}
              disabled={saving}
              style={inputStyle}
            >
              <option>Normal Delivery</option>
              <option>Same Day Delivery</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Amount to Collect (৳)</label>
            <input
              type="number"
              min="0"
              step="any"
              value={amountToCollect}
              onChange={(e) => setAmountToCollect(e.target.value)}
              disabled={saving}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Special Instructions</label>
            <textarea
              rows={2}
              placeholder="Handle with care…"
              value={specialInstr}
              onChange={(e) => setSpecialInstr(e.target.value)}
              disabled={saving}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
        </div>
      )}

      <Button
        onClick={handleConfirm}
        disabled={
          saving ||
          (mode === 'pathao' && !hasPathaoLocation) ||
          // Nothing to change when already on the selected mode
          (order.deliveryMode === mode)
        }
        style={{ alignSelf: 'flex-start', minWidth: '9rem' }}
      >
        {saving
          ? 'Confirming…'
          : order.deliveryMode === 'manual' && mode === 'pathao'
            ? 'Switch to Pathao'
            : order.deliveryMode == null
              ? 'Confirm Order'
              : 'Confirmed'}
      </Button>
    </div>
  );
}
