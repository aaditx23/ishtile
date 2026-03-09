import { convex } from './convexClient';
import { asId, fromId, buildPagination } from './convexHelpers';
import { api } from '../../../convex/_generated/api';
import { requireConvexUserId } from './convexAuth';
import type { OrderRepository, CreateOrderPayload, ListOrdersParams, PaginatedOrders } from '@/domain/order/order.repository';
import type { Order, OrderItem } from '@/domain/order/order.entity';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOrderItem(item: any): OrderItem {
  return {
    id:           asId(item._id),
    productName:  item.productName,
    variantSize:  item.variantSize,
    variantColor: item.variantColor ?? null,
    variantSku:   item.variantSku,
    unitPrice:    item.unitPrice,
    quantity:     item.quantity,
    lineTotal:    item.lineTotal,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOrder(o: any): Order {
  return {
    id:                 asId(o._id),
    orderNumber:        o.orderNumber,
    userId:             asId(o.userId),
    status:             o.status,
    subtotal:           o.subtotal,
    promoDiscount:      o.promoDiscount,
    shippingCost:       o.shippingCost,
    total:              o.total,
    shippingName:       o.shippingName,
    shippingPhone:      o.shippingPhone,
    shippingAddress:    o.shippingAddress,
    shippingCity:       o.shippingCity,
    shippingPostalCode: o.shippingPostalCode ?? null,
    customerNotes:      o.customerNotes ?? null,
    adminNotes:         o.adminNotes ?? null,
    isPaid:             o.isPaid,
    paymentMethod:      'cod',
    createdAt:          new Date(o._creationTime).toISOString(),
    items:              o.items ? o.items.map(mapOrderItem) : undefined,
  };
}

export class OrderConvexRepository implements OrderRepository {
  async create(payload: CreateOrderPayload): Promise<Order> {
    const userId = requireConvexUserId();
    const res = await convex.mutation(api.orders.mutations.createOrder, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userId:             userId as any,
      shippingName:       payload.shippingName,
      shippingPhone:      payload.shippingPhone,
      shippingAddress:    payload.shippingAddress,
      shippingCity:       payload.shippingCity,
      shippingPostalCode: payload.shippingPostalCode,
      shippingAddressLine: payload.shippingAddressLine,
      shippingCityId:     payload.shippingCityId,
      shippingZoneId:     payload.shippingZoneId,
      shippingAreaId:     payload.shippingAreaId,
      customerNotes:      payload.customerNotes,
      promoCode:          payload.promoCode,
    });

    if (!res.success) {
      // Cart was modified — throw a special error the UI can catch
      throw Object.assign(new Error('CART_UPDATED'), { cartUpdated: true });
    }

    // Fetch the created order to return the full entity
    const order = await convex.query(api.orders.queries.getOrderById, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orderId: res.orderId as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userId:  userId as any,
      role:    'buyer',
    });
    if (!order) throw new Error('Order not found after creation');
    return mapOrder(order);
  }

  async list(params?: ListOrdersParams): Promise<PaginatedOrders> {
    const userId = requireConvexUserId();
    const res = await convex.query(api.orders.queries.listOrders, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userId:   userId as any,
      role:     'buyer',
      status:   params?.status as any,
      page:     params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
    });

    return {
      items:      res.items.map(mapOrder),
      pagination: buildPagination(res.total, res.page, res.pageSize),
    };
  }

  async getById(id: number): Promise<Order | null> {
    const userId = requireConvexUserId();
    const res = await convex.query(api.orders.queries.getOrderById, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orderId: fromId(id) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userId:  userId as any,
      role:    'buyer',
    });
    if (!res) return null;
    return mapOrder(res);
  }
}
