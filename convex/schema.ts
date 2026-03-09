import { defineSchema } from 'convex/server';

// Import modular schemas
import { authTables } from './auth/schema';
import { categoryTables } from './categories/schema';
import { productTables } from './products/schema';
import { cartTables } from './cart/schema';
import { favouriteTables } from './favourites/schema';
import { orderTables } from './orders/schema';
import { promoTables } from './promos/schema';
import { shipmentTables } from './shipments/schema';
import { adminTables } from './admin/schema';
import { analyticsTables } from './analytics/schema';

// Combine all tables into a single schema
export default defineSchema({
  ...authTables,
  ...categoryTables,
  ...productTables,
  ...cartTables,
  ...favouriteTables,
  ...orderTables,
  ...promoTables,
  ...shipmentTables,
  ...adminTables,
  ...analyticsTables,
});
