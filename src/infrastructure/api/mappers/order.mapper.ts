import type { OrderDto, OrderDetailDto, OrderItemDto } from '@/shared/types/api.types';
import type { Order, OrderItem } from '@/domain/order/order.entity';

export function mapOrderItem(dto: OrderItemDto): OrderItem {
  return {
    id:           dto.id,
    productName:  dto.productName,
    variantSize:  dto.variantSize,
    variantColor: dto.variantColor,
    variantSku:   dto.variantSku,
    unitPrice:    dto.unitPrice,
    quantity:     dto.quantity,
    lineTotal:    dto.lineTotal,
  };
}

export function mapOrder(dto: OrderDto | OrderDetailDto): Order {
  const items =
    'items' in dto ? dto.items.map(mapOrderItem) : undefined;

  return {
    id:                  dto.id,
    orderNumber:         dto.orderNumber,
    userId:              dto.userId,
    status:              dto.status,
    deliveryMode:        dto.deliveryMode ?? 'manual',
    pathaoConsignmentId: dto.pathaoConsignmentId ?? null,
    pathaoStatus:        dto.pathaoStatus ?? null,
    pathaoPrice:         dto.pathaoPrice ?? null,
    pathaoRawPayload:    dto.pathaoRawPayload,
    subtotal:            dto.subtotal,
    promoDiscount:       dto.promoDiscount,
    shippingCost:        dto.shippingCost,
    total:               dto.total,
    shippingName:        dto.shippingName,
    shippingPhone:       dto.shippingPhone,
    shippingAddress:     dto.shippingAddress,
    shippingAddressLine: dto.shippingAddressLine ?? null,
    shippingCity:        dto.shippingCity,
    shippingCityId:      dto.shippingCityId ?? null,
    shippingZoneId:      dto.shippingZoneId ?? null,
    shippingAreaId:      dto.shippingAreaId ?? null,
    shippingPostalCode:  dto.shippingPostalCode,
    customerNotes:       dto.customerNotes,
    adminNotes:          dto.adminNotes,
    isPaid:              dto.isPaid,
    paymentMethod:       dto.paymentMethod,
    createdAt:           dto.createdAt,
    items,
  };
}
