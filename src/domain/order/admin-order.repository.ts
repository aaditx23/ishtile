import type { OrderStatus } from '@/shared/types/api.types';

export interface UpdateOrderStatusPayload {
  status:      OrderStatus;
  adminNotes?: string;
}

export interface UpdateOrderShippingPayload {
  shippingName?: string;
  shippingPhone?: string;
  shippingAddress?: string;
  shippingAddressLine?: string;
  shippingPostalCode?: string | null;
  shippingCity?: string;
  shippingCityId?: number | null;
  shippingZoneId?: number | null;
  shippingZoneName?: string | null;
  shippingAreaId?: number | null;
  shippingAreaName?: string | null;
}
