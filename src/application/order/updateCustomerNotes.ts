import { tokenStore } from '@/infrastructure/auth/tokenStore';

/**
 * Update customerNotes for an order (admin only).
 */
export async function updateCustomerNotes(
  orderId: string,
  customerNotes: string,
): Promise<void> {
  const token = tokenStore.getAccess();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`/api/admin/orders/${orderId}/customer-notes`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({ customerNotes }),
  });

  if (!res.ok) {
    const text = await res.text();
    let message = 'Failed to update customer notes';
    try { message = JSON.parse(text).message || message; } catch { /* noop */ }
    throw new Error(message);
  }
}
