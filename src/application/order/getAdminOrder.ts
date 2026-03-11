import { adminOrderRepository } from '@/lib/di';
import type { Order } from '@/domain/order/order.entity';

export async function getAdminOrder(orderId: number): Promise<Order | null> {
  return adminOrderRepository.getById(orderId);
}
