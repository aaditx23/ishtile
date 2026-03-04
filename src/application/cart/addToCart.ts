import { cartRepository } from '@/lib/di';

export async function addToCart(variantId: number, quantity: number): Promise<void> {
  if (quantity < 1) throw new Error('Quantity must be at least 1.');
  await cartRepository.addItem(variantId, quantity);
}
