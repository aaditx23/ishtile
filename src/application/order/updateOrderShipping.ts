import { adminOrderRepository } from '@/lib/di';
import type { Order } from '@/domain/order/order.entity';
import type { UpdateOrderShippingPayload } from '@/domain/order/admin-order.repository';

export async function updateOrderShipping(
  orderId: number,
  payload: UpdateOrderShippingPayload,
): Promise<Order> {
  return adminOrderRepository.updateShippingDetails(orderId, payload);
}
