import { convex } from './convexClient';
import { asId, fromId } from './convexHelpers';
import { api } from '../../../convex/_generated/api';
import { requireConvexUserId } from './convexAuth';
import type { CartRepository } from '@/domain/cart/cart.repository';
import type { Cart, CartItem } from '@/domain/cart/cart.entity';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCartItem(item: any): CartItem {
  return {
    id:             asId(item.id ?? item._id),
    variantId:      asId(item.variantId),
    quantity:       item.quantity,
    productName:    item.productName ?? '',
    variantSize:    item.variantSize ?? '',
    variantColor:   item.variantColor ?? null,
    variantSku:     item.variantSku ?? '',
    unitPrice:      item.unitPrice ?? 0,
    lineTotal:      item.lineTotal ?? 0,
    imageUrl:       item.imageUrl ?? null,
    availableStock: item.availableStock ?? 0,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCart(res: any): Cart {
  return {
    id:         asId(res.id ?? res.cartId ?? res._id ?? 'cart'),
    userId:     asId(res.userId ?? ''),
    items:      (res.items ?? []).map(mapCartItem),
    subtotal:   res.subtotal ?? 0,
    totalItems: res.totalItems ?? 0,
  };
}

export class CartConvexRepository implements CartRepository {
  async getCart(): Promise<Cart> {
    const userId = requireConvexUserId();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await convex.query(api.cart.queries.getCart, { userId: userId as any });
    return mapCart(res);
  }

  async addItem(variantId: number, quantity: number): Promise<void> {
    const userId = requireConvexUserId();
    await convex.mutation(api.cart.mutations.addItem, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userId:    userId as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      variantId: fromId(variantId) as any,
      quantity,
    });
  }

  async updateItem(itemId: number, quantity: number): Promise<void> {
    const userId = requireConvexUserId();
    await convex.mutation(api.cart.mutations.updateItem, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      itemId:    fromId(itemId) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userId:    userId as any,
      quantity,
    });
  }

  async removeItem(itemId: number): Promise<void> {
    const userId = requireConvexUserId();
    await convex.mutation(api.cart.mutations.removeItem, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      itemId: fromId(itemId) as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userId: userId as any,
    });
  }

  async clearCart(): Promise<void> {
    const userId = requireConvexUserId();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await convex.mutation(api.cart.mutations.clearCart, { userId: userId as any });
  }
}
