import type { OrderStatus } from '@/shared/types/api.types';

export type { OrderStatus };

export interface OrderItem {
  id: number;
  productName: string;
  variantSize: string;
  variantColor: string | null;
  variantSku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  status: OrderStatus;
  deliveryMode: 'manual' | 'pathao';
  pathaoConsignmentId?: string | null;
  pathaoStatus?: string | null;
  pathaoPrice?: number | null;
  pathaoRawPayload?: unknown;
  subtotal: number;
  promoDiscount: number;
  shippingCost: number;
  total: number;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingAddressLine?: string | null;
  shippingCity: string;
  shippingCityId?: number | null;
  shippingZoneId?: number | null;
  shippingAreaId?: number | null;
  shippingPostalCode: string | null;
  customerNotes: string | null;
  adminNotes: string | null;
  isPaid: boolean;
  paymentMethod: 'cod';
  createdAt: string;
  items?: OrderItem[];
}
