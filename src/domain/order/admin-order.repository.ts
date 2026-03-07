import type { OrderStatus } from '@/shared/types/api.types';

export interface UpdateOrderStatusPayload {
  status:      OrderStatus;
  adminNotes?: string;
}
