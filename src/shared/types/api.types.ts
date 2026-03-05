// ─── Response Envelope ───────────────────────────────────────────────────────

export interface ApiResponse {
  success: boolean;
  message: string;
  data: unknown;
  listData: unknown[] | null;
}

/** Single-object response — data is populated, listData is null */
export interface DataResponse<T> extends ApiResponse {
  data: T;
  listData: null;
}

/** Paginated list — data holds pagination meta, listData holds items */
export interface PaginatedResponse<T> extends ApiResponse {
  data: { pagination: Pagination };
  listData: T[];
}

/** Auth response — token holds JWT access token */
export interface AuthResponse<T = null> extends ApiResponse {
  data: T;
  listData: null;
  token: string;
}

/** Action-only response (create/update/delete with no returned object) */
export interface ActionResponse extends ApiResponse {
  data: null;
  listData: null;
}

/** Refresh token response */
export interface RefreshTokenResponse extends ApiResponse {
  data: null;
  listData: null;
  token: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface UserDto {
  id: number;
  username: string | null;
  phone: string;
  email: string | null;
  fullName: string | null;
  role: string; // "buyer" | "admin"
  isActive: boolean;
  isVerified: boolean;
  avatarUrl: string | null;
  googleId: string | null;
  facebookId: string | null;
  addressLine: string | null;
  city: string | null;
  postalCode: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string;
  lastLoginAt: string | null;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface CategoryDto {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubcategoryDto {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWithSubcategoriesDto extends CategoryDto {
  subcategories: SubcategoryDto[];
}

// ─── Product ──────────────────────────────────────────────────────────────────

export interface ProductVariantDto {
  id: number;
  productId: number;
  size: string;
  color: string | null;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  weightGrams: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDto {
  id: number;
  categoryId: number;
  subcategoryId: number | null;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  imageUrls: string[] | null;
  material: string | null;
  careInstructions: string | null;
  brand: string | null;
  isActive: boolean;
  isFeatured: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductWithVariantsDto extends ProductDto {
  variants: ProductVariantDto[];
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export interface InventoryDto {
  id: number;
  variantId: number;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  updatedAt: string;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItemDto {
  id: number;
  variantId: number;
  quantity: number;
  productName: string;
  variantSize: string;
  variantColor: string | null;
  variantSku: string;
  unitPrice: number;
  lineTotal: number;
  imageUrl: string | null;
  availableStock: number;
  createdAt: string;
}

export interface CartDto {
  id: number;
  userId: number;
  items: CartItemDto[];
  subtotal: number;
  totalItems: number;
  updatedAt: string;
}

// ─── Order ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItemDto {
  id: number;
  productName: string;
  variantSize: string;
  variantColor: string | null;
  variantSku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderDto {
  id: number;
  orderNumber: string;
  userId: number;
  status: OrderStatus;
  subtotal: number;
  promoDiscount: number;
  shippingCost: number;
  total: number;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string | null;
  shippingAddressLine: string | null;
  shippingCityId: number | null;
  shippingZoneId: number | null;
  shippingAreaId: number | null;
  customerNotes: string | null;
  adminNotes: string | null;
  isPaid: boolean;
  paymentMethod: 'cod';
  createdAt: string;
  updatedAt: string;
  confirmedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
}

export interface OrderDetailDto extends OrderDto {
  items: OrderItemDto[];
}

// ─── Promo ────────────────────────────────────────────────────────────────────

export interface PromoDto {
  id: number;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minimumOrderValue: number | null;
  maximumDiscount: number | null;
  maxTotalUses: number | null;
  maxUsesPerUser: number | null;
  currentUses: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PromoValidationDto {
  isValid: boolean;
  discountAmount: number;
  message: string;
}

// ─── Favourite ────────────────────────────────────────────────────────────────

export interface FavouriteDto {
  id: number;
  userId: number;
  productId: number;
  productName: string;
  productSlug: string;
  basePrice: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface DashboardStatsDto {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  lowStockVariants: number;
  totalCustomers: number;
  activePromos: number;
}

export interface DailySalesDto {
  summaryDate: string; // "YYYY-MM-DD"
  totalOrders: number;
  totalRevenue: number;
  totalDiscount: number;
  totalShipping: number;
  newOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  uniqueCustomers: number;
  newCustomers: number;
}

export interface ProductSalesDto {
  productId: number;
  variantId: number | null;
  productName: string;
  variantSize: string | null;
  totalQuantitySold: number;
  totalRevenue: number;
  totalOrders: number;
}

export interface PromoSalesDto {
  promoId: number;
  promoCode: string;
  totalUses: number;
  totalDiscountGiven: number;
  totalRevenueGenerated: number;
  uniqueUsers: number;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AuditLogDto {
  id: number;
  userId: number | null;
  actionType: string;
  entityType: string;
  entityId: number | null;
  description: string | null;
  createdAt: string;
}

export interface MemoDto {
  id: number;
  orderId: number;
  memoNumber: string;
  pdfPath: string | null;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Locations (Pathao) ───────────────────────────────────────────────────────

export interface PathaoCityDto {
  cityId:   number;
  cityName: string;
}

export interface PathaoZoneDto {
  zoneId:   number;
  zoneName: string;
}

export interface PathaoAreaDto {
  areaId:   number;
  areaName: string;
}

// ─── Error ────────────────────────────────────────────────────────────────────

export interface ErrorResponseBody {
  success: false;
  message: string;
  data: null | { errors?: string[]; details?: string };
  listData: null;
}

// ─── Endpoint-specific response aliases ──────────────────────────────────────

export type PasswordLoginResponse = AuthResponse<{ refreshToken: string }>;
export type RegisterResponse = AuthResponse<{ user: UserDto; refreshToken: string }>;

export type GetProfileResponse = DataResponse<UserDto>;
export type UpdateProfileResponse = DataResponse<UserDto>;

export type ListCategoriesResponse = PaginatedResponse<CategoryWithSubcategoriesDto>;
export type GetCategoryResponse = DataResponse<CategoryWithSubcategoriesDto>;
export type CreateCategoryResponse = DataResponse<CategoryDto>;
export type UpdateCategoryResponse = DataResponse<CategoryDto>;
export type DeleteCategoryResponse = ActionResponse;
export type CreateSubcategoryResponse = DataResponse<SubcategoryDto>;
export type UpdateSubcategoryResponse = DataResponse<SubcategoryDto>;
export type DeleteSubcategoryResponse = ActionResponse;

export type ListProductsResponse = PaginatedResponse<ProductDto | ProductWithVariantsDto>;
export type GetProductResponse = DataResponse<ProductDto | ProductWithVariantsDto>;

export type GetCartResponse = DataResponse<CartDto>;
export type AddToCartResponse = ActionResponse;
export type UpdateCartItemResponse = ActionResponse;
export type RemoveCartItemResponse = ActionResponse;
export type ClearCartResponse = ActionResponse;

export type CreateOrderResponse = DataResponse<OrderDto>;
export type ListOrdersResponse = PaginatedResponse<OrderDto>;
export type GetOrderResponse = DataResponse<OrderDetailDto>;

export type ValidatePromoResponse = DataResponse<PromoValidationDto>;

export type ListFavouritesResponse = PaginatedResponse<FavouriteDto>;
export type AddFavouriteResponse = ActionResponse;
export type RemoveFavouriteResponse = ActionResponse;

export type GetCitiesResponse  = ApiResponse & { data: null; listData: PathaoCityDto[] };
export type GetZonesResponse   = ApiResponse & { data: null; listData: PathaoZoneDto[] };
export type GetAreasResponse   = ApiResponse & { data: null; listData: PathaoAreaDto[] };
