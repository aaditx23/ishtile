import { cartRepository } from '@/lib/di';

export async function clearCart(): Promise<void> {
  await cartRepository.clearCart();
}
