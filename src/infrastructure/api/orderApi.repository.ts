import { apiClient } from './apiClient';
import { ENDPOINTS } from './endpoints';
import { mapOrder } from './mappers/order.mapper';
import type { OrderRepository, CreateOrderPayload, ListOrdersParams, PaginatedOrders } from '@/domain/order/order.repository';
import type { Order } from '@/domain/order/order.entity';
import type { CreateOrderResponse, ListOrdersResponse, GetOrderResponse } from '@/shared/types/api.types';

export class OrderApiRepository implements OrderRepository {
  async create(payload: CreateOrderPayload): Promise<Order> {
    const res = await apiClient.post<CreateOrderResponse>(ENDPOINTS.orders.list, payload);
    return mapOrder(res.data);
  }

  async list(params?: ListOrdersParams): Promise<PaginatedOrders> {
    const res = await apiClient.get<ListOrdersResponse>(ENDPOINTS.orders.list, {
      params: {
        page:     params?.page,
        pageSize: params?.pageSize,
        status:   params?.status,
      },
    });

    return {
      items:      res.listData.map(mapOrder),
      pagination: res.data.pagination,
    };
  }

  async getById(id: number): Promise<Order | null> {
    try {
      const res = await apiClient.get<GetOrderResponse>(ENDPOINTS.orders.detail(id));
      return mapOrder(res.data);
    } catch {
      return null;
    }
  }
}
