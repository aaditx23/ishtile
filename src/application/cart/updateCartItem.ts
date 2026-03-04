import { cartRepository } from '@/lib/di';

export async function updateCartItem(itemId: number, quantity: number): Promise<void> {
  if (quantity < 1) throw new Error('Quantity must be at least 1.');
  await cartRepository.updateItem(itemId, quantity);
}
