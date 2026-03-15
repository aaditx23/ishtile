import { defineSchema } from 'convex/server';

// Import modular schemas
import { authTables } from './auth/schema';
import { categoryTables } from './categories/schema';
import { brandTables } from './brands/schema';
import { productTables } from './products/schema';
import { cartTables } from './cart/schema';
import { favouriteTables } from './favourites/schema';
import { orderTables } from './orders/schema';
import { promoTables } from './promos/schema';
import { shipmentTables } from './shipments/schema';
import { adminTables } from './admin/schema';
import { analyticsTables } from './analytics/schema';
import { lookbookTables } from './lookbooks/schema';

// Combine all tables into a single schema
export default defineSchema({
  ...authTables,
  ...categoryTables,
  ...brandTables,
  ...productTables,
  ...cartTables,
  ...favouriteTables,
  ...orderTables,
  ...promoTables,
  ...shipmentTables,
  ...adminTables,
  ...analyticsTables,
  ...lookbookTables,
});
