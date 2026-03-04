import { adminOrderRepository } from '@/lib/di';
import type { Order } from '@/domain/order/order.entity';
import type { UpdateOrderStatusPayload } from '@/domain/order/admin-order.repository';

export async function updateOrderStatus(
  orderId: number,
  payload: UpdateOrderStatusPayload,
): Promise<Order> {
  return adminOrderRepository.updateStatus(orderId, payload);
}
