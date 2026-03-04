import { orderRepository } from '@/lib/di';
import type { PaginatedOrders, ListOrdersParams } from '@/domain/order/order.repository';

export async function getOrders(params?: ListOrdersParams): Promise<PaginatedOrders> {
  return orderRepository.list(params);
}
