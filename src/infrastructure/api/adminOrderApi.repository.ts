import { apiClient } from './apiClient';
import { ENDPOINTS } from './endpoints';
import { mapOrder } from './mappers/order.mapper';
import type { Order } from '@/domain/order/order.entity';
import type { UpdateOrderStatusPayload } from '@/domain/order/admin-order.repository';
import type { DataResponse } from '@/shared/types/api.types';
import type { OrderDto } from '@/shared/types/api.types';

export class AdminOrderApiRepository {
  async updateStatus(orderId: number, payload: UpdateOrderStatusPayload): Promise<Order> {
    const res = await apiClient.put<DataResponse<OrderDto>>(
      ENDPOINTS.admin.orders.status(orderId),
      payload,
    );
    return mapOrder(res.data);
  }
}
