import { cartRepository } from '@/lib/di';
import type { Cart } from '@/domain/cart/cart.entity';

export async function getCart(): Promise<Cart> {
  return cartRepository.getCart();
}
