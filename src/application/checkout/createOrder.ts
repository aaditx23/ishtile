import { cartRepository, orderRepository } from '@/lib/di';
import type { Order } from '@/domain/order/order.entity';
import type { CreateOrderPayload } from '@/domain/order/order.repository';

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const cart = await cartRepository.getCart();
  if (cart.totalItems === 0) throw new Error('Your cart is empty.');
  return orderRepository.create(payload);
}
