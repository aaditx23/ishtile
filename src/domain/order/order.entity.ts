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
  subtotal: number;
  promoDiscount: number;
  shippingCost: number;
  total: number;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string | null;
  customerNotes: string | null;
  adminNotes: string | null;
  isPaid: boolean;
  paymentMethod: 'cod';
  createdAt: string;
  items?: OrderItem[];
}
