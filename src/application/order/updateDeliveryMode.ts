import { adminOrderRepository } from '@/lib/di';
import type { Order } from '@/domain/order/order.entity';

export async function updateDeliveryMode(
  orderId: number,
  deliveryMode: 'manual' | 'pathao',
): Promise<Order> {
  return adminOrderRepository.updateDeliveryMode(orderId, deliveryMode);
}
