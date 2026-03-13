import type { OrderStatus } from '@/shared/types/api.types';

export type { OrderStatus };

export type DeliveryMode = 'manual' | 'pathao';
export type ShipmentStatus =
  | 'pending'
  | 'created'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'returned'
  | 'cancelled';

export interface Shipment {
  id: number;
  orderId: number;
  consignmentId: string | null;
  deliveryFee?: number;
  itemWeight?: number;
  itemQuantity?: number;
  deliveryType?: string;
  specialInstructions?: string | null;
  pathaoStatus?: string | null;
  status: ShipmentStatus;
  statusUpdateTime?: number | null;
  deliveryProvider?: string;
  trackingData?: string | null;
  createdAt: string;
}

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
  shippingAddressLine?: string | null;
  shippingCityId?: number | null;
  shippingZoneId?: number | null;
  shippingAreaId?: number | null;
  customerNotes: string | null;
  adminNotes: string | null;
  isPaid: boolean;
  paymentMethod: 'cod';
  deliveryMode?: DeliveryMode | null;
  createdAt: string;
  items?: OrderItem[];
  shipment?: Shipment | null;
}
