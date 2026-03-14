import { convex } from '@/infrastructure/convex/convexClient';
import { api } from '../../../convex/_generated/api';

export async function getCheckoutShippingCost(shippingCity: string): Promise<number> {
  const result = await convex.query(api.orders.queries.getCheckoutShippingCost, {
    shippingCity,
  });

  return result.shippingCost;
}
