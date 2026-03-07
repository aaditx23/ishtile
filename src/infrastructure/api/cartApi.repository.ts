import { apiClient } from './apiClient';
import { ENDPOINTS } from './endpoints';
import { mapCart } from './mappers/cart.mapper';
import type { CartRepository } from '@/domain/cart/cart.repository';
import type { Cart } from '@/domain/cart/cart.entity';
import type { GetCartResponse, ActionResponse } from '@/shared/types/api.types';

export class CartApiRepository implements CartRepository {
  async getCart(): Promise<Cart> {
    const res = await apiClient.get<GetCartResponse>(ENDPOINTS.cart.root);
    return mapCart(res.data);
  }

  async addItem(variantId: number, quantity: number): Promise<void> {
    await apiClient.post<ActionResponse>(ENDPOINTS.cart.items, { variantId, quantity });
  }

  async updateItem(itemId: number, quantity: number): Promise<void> {
    await apiClient.put<ActionResponse>(ENDPOINTS.cart.item(itemId), { quantity });
  }

  async removeItem(itemId: number): Promise<void> {
    await apiClient.delete<ActionResponse>(ENDPOINTS.cart.item(itemId));
  }

  async clearCart(): Promise<void> {
    await apiClient.delete<ActionResponse>(ENDPOINTS.cart.root);
  }
}
