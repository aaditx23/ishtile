/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as _internal_inventory from "../_internal/inventory.js";
import type * as _internal_promoEngine from "../_internal/promoEngine.js";
import type * as admin_mutations from "../admin/mutations.js";
import type * as admin_queries from "../admin/queries.js";
import type * as analytics_queries from "../analytics/queries.js";
import type * as auth_otps from "../auth/otps.js";
import type * as auth_users from "../auth/users.js";
import type * as cart_mutations from "../cart/mutations.js";
import type * as cart_queries from "../cart/queries.js";
import type * as categories_mutations from "../categories/mutations.js";
import type * as categories_queries from "../categories/queries.js";
import type * as favourites_mutations from "../favourites/mutations.js";
import type * as favourites_queries from "../favourites/queries.js";
import type * as orders_mutations from "../orders/mutations.js";
import type * as orders_queries from "../orders/queries.js";
import type * as products_mutations from "../products/mutations.js";
import type * as products_queries from "../products/queries.js";
import type * as promos_mutations from "../promos/mutations.js";
import type * as promos_queries from "../promos/queries.js";
import type * as shipments_mutations from "../shipments/mutations.js";
import type * as shipments_queries from "../shipments/queries.js";
import type * as users_mutations from "../users/mutations.js";
import type * as users_queries from "../users/queries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "_internal/inventory": typeof _internal_inventory;
  "_internal/promoEngine": typeof _internal_promoEngine;
  "admin/mutations": typeof admin_mutations;
  "admin/queries": typeof admin_queries;
  "analytics/queries": typeof analytics_queries;
  "auth/otps": typeof auth_otps;
  "auth/users": typeof auth_users;
  "cart/mutations": typeof cart_mutations;
  "cart/queries": typeof cart_queries;
  "categories/mutations": typeof categories_mutations;
  "categories/queries": typeof categories_queries;
  "favourites/mutations": typeof favourites_mutations;
  "favourites/queries": typeof favourites_queries;
  "orders/mutations": typeof orders_mutations;
  "orders/queries": typeof orders_queries;
  "products/mutations": typeof products_mutations;
  "products/queries": typeof products_queries;
  "promos/mutations": typeof promos_mutations;
  "promos/queries": typeof promos_queries;
  "shipments/mutations": typeof shipments_mutations;
  "shipments/queries": typeof shipments_queries;
  "users/mutations": typeof users_mutations;
  "users/queries": typeof users_queries;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
