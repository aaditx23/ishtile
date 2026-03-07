import type { CartDto, CartItemDto } from '@/shared/types/api.types';
import type { Cart, CartItem } from '@/domain/cart/cart.entity';

export function mapCartItem(dto: CartItemDto): CartItem {
  return {
    id:             dto.id,
    variantId:      dto.variantId,
    quantity:       dto.quantity,
    productName:    dto.productName,
    variantSize:    dto.variantSize,
    variantColor:   dto.variantColor,
    variantSku:     dto.variantSku,
    unitPrice:      dto.unitPrice,
    lineTotal:      dto.lineTotal,
    imageUrl:       dto.imageUrl,
    availableStock: dto.availableStock,
  };
}

export function mapCart(dto: CartDto): Cart {
  return {
    id:         dto.id,
    userId:     dto.userId,
    items:      dto.items.map(mapCartItem),
    subtotal:   dto.subtotal,
    totalItems: dto.totalItems,
  };
}
