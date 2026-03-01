import type { Cart, CartItem } from './cart.entity';

export interface CartRepository {
  getCart(): Promise<Cart>;
  addItem(item: CartItem): Promise<Cart>;
  removeItem(productId: string): Promise<Cart>;
}
