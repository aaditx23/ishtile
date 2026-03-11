import { convex } from './convexClient';
import { asId, fromId, buildPagination } from './convexHelpers';
import { api } from '../../../convex/_generated/api';
import { requireConvexUserId } from './convexAuth';
import type { Order, OrderItem } from '@/domain/order/order.entity';
import type { UpdateOrderStatusPayload } from '@/domain/order/admin-order.repository';
import type { ListOrdersParams, PaginatedOrders } from '@/domain/order/order.repository';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOrderItem(item: any): OrderItem {
  return {
    id: asId(item._id), productName: item.productName, variantSize: item.variantSize,
    variantColor: item.variantColor ?? null, variantSku: item.variantSku,
    unitPrice: item.unitPrice, quantity: item.quantity, lineTotal: item.lineTotal,
  };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOrder(o: any): Order {
  return {
    id: asId(o._id), orderNumber: o.orderNumber, userId: asId(o.userId),
    status: o.status, subtotal: o.subtotal, promoDiscount: o.promoDiscount,
    shippingCost: o.shippingCost, total: o.total,
    shippingName: o.shippingName, shippingPhone: o.shippingPhone,
    shippingAddress: o.shippingAddress, shippingCity: o.shippingCity,
    shippingPostalCode: o.shippingPostalCode ?? null,
    customerNotes: o.customerNotes ?? null, adminNotes: o.adminNotes ?? null,
    isPaid: o.isPaid, paymentMethod: 'cod',
    createdAt: new Date(o._creationTime).toISOString(),
    items: o.items ? o.items.map(mapOrderItem) : undefined,
  };
}

export class AdminOrderConvexRepository {
  async list(params?: ListOrdersParams): Promise<PaginatedOrders> {
    const adminUserId = requireConvexUserId();
    const res = await convex.query(api.orders.queries.listOrders, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userId:   adminUserId as any,
      role:     'admin',
      status:   params?.status as any,
      page:     params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
    });

    return {
      items:      res.items.map(mapOrder),
      pagination: buildPagination(res.total, res.page, res.pageSize),
    };
  }

  async getById(orderId: number): Promise<Order | null> {
    const adminUserId = requireConvexUserId();
    const res = await convex.query(api.orders.queries.getOrderById, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orderId: fromId(orderId) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userId:  adminUserId as any,
      role:    'admin',
    });
    if (!res) return null;
    return mapOrder(res);
  }

  async updateStatus(orderId: number, payload: UpdateOrderStatusPayload): Promise<Order> {
    const adminUserId = requireConvexUserId();
    await convex.mutation(api.orders.mutations.updateOrderStatus, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orderId:    fromId(orderId) as any,
      status:     payload.status,
      adminNotes: payload.adminNotes,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      adminUserId: adminUserId as any,
    });

    // Fetch updated order to return full entity
    const res = await convex.query(api.orders.queries.getOrderById, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      orderId: fromId(orderId) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userId:  adminUserId as any,
      role:    'admin',
    });
    if (!res) throw new Error('Order not found after status update');
    return mapOrder(res);
  }
}
