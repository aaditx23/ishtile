import { cartRepository } from '@/lib/di';

export async function removeFromCart(itemId: number): Promise<void> {
  await cartRepository.removeItem(itemId);
}
