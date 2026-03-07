import type { Cart } from './cart.entity';

export interface CartRepository {
  getCart(): Promise<Cart>;
  addItem(variantId: number, quantity: number): Promise<void>;
  updateItem(itemId: number, quantity: number): Promise<void>;
  removeItem(itemId: number): Promise<void>;
  clearCart(): Promise<void>;
}
