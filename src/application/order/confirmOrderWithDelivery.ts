/**
 * Application use-case: Confirm an order with a chosen delivery mode.
 * Thin wrapper around the /api/admin/orders/[orderId]/confirm endpoint
 * so presentation layer stays decoupled from direct fetch calls.
 */
import { tokenStore } from '@/infrastructure/auth/tokenStore';

export interface ConfirmOrderPayload {
  deliveryMode:          'manual' | 'pathao';
  itemWeight?:           number;
  itemQuantity?:         number;
  deliveryType?:         'Normal Delivery' | 'Same Day Delivery';
  amountToCollect?:      number;
  specialInstructions?:  string;
  adminNotes?:           string;
  shippingCost?:         number;
}

export interface ConfirmOrderResult {
  orderId:         string;
  deliveryMode:    'manual' | 'pathao';
  consignmentId?:  string;
  deliveryFee?:    number;
  pathaoStatus?:   string;
}

export async function confirmOrderWithDelivery(
  orderId: number,
  payload: ConfirmOrderPayload,
): Promise<ConfirmOrderResult> {
  const token = tokenStore.getAccess();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`/api/admin/orders/${orderId}/confirm`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message ?? `Confirm failed: HTTP ${res.status}`);
  }

  return json.data as ConfirmOrderResult;
}
