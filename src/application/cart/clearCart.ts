import { cartRepository } from '@/lib/di';

export async function clearCart(): Promise<void> {
  await cartRepository.clearCart();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('CART_UPDATED'));
  }
}
