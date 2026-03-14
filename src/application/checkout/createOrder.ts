import { cartRepository, orderRepository } from '@/lib/di';
import type { Order } from '@/domain/order/order.entity';
import type { CreateOrderPayload } from '@/domain/order/order.repository';
import { getAddressLengthError } from '@/shared/utils/addressValidation';

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const cart = await cartRepository.getCart();
  if (cart.totalItems === 0) throw new Error('Your cart is empty.');

  const addressError = getAddressLengthError(payload.shippingAddress);
  if (addressError) throw new Error(addressError);

  return await orderRepository.create({
    ...payload,
    deliveryMode: 'manual',
  });
}
