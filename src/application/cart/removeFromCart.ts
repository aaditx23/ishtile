import { cartRepository } from '@/lib/di';

export async function removeFromCart(itemId: number): Promise<void> {
  await cartRepository.removeItem(itemId);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('CART_UPDATED'));
  }
}
