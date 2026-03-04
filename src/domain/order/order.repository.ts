import type { Order } from './order.entity';
import type { Pagination } from '@/shared/types/api.types';

export interface CreateOrderPayload {
  shippingName:        string;
  shippingPhone:       string;
  shippingAddress:     string;
  shippingCity:        string;
  shippingPostalCode?: string;
  /** Pathao fields — optional for Phase 1 (plain text addresses) */
  shippingAddressLine?: string;
  shippingCityId?:     number;
  shippingZoneId?:     number;
  shippingAreaId?:     number;
  paymentMethod?:      'cod';
  promoCode?:          string;
  customerNotes?:      string;
}

export interface ListOrdersParams {
  page?: number;
  pageSize?: number;
  status?: string;
}

export interface PaginatedOrders {
  items: Order[];
  pagination: Pagination;
}

export interface OrderRepository {
  create(payload: CreateOrderPayload): Promise<Order>;
  list(params?: ListOrdersParams): Promise<PaginatedOrders>;
  getById(id: number): Promise<Order | null>;
}
