import { adminOrderRepository } from '@/lib/di';
import type { PaginatedOrders, ListOrdersParams } from '@/domain/order/order.repository';

export async function getAdminOrders(params?: ListOrdersParams): Promise<PaginatedOrders> {
  return adminOrderRepository.list(params);
}
