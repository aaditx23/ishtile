import { orderRepository } from '@/lib/di';
import type { Order } from '@/domain/order/order.entity';

export async function getOrder(id: number): Promise<Order | null> {
  return orderRepository.getById(id);
}
