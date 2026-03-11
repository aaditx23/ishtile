const BASE = process.env.NEXT_PUBLIC_API_URL!.replace(/\/$/, '');

export const API_BASE = `${BASE}/api/v1`;

export const ENDPOINTS = {
  // ─── Auth ─────────────────────────────────────────────────────────────────
  auth: {
    login: `${API_BASE}/auth/login`,
    register: `${API_BASE}/auth/register`,
    refresh: `${API_BASE}/auth/refresh`,
  },

  // ─── Users ────────────────────────────────────────────────────────────────
  users: {
    me:       `${API_BASE}/users/me`,
    addresses: `${API_BASE}/users/addresses`,
    address:  (id: number) => `${API_BASE}/users/addresses/${id}`,
  },

  // ─── Categories ───────────────────────────────────────────────────────────
  categories: {
    list: `${API_BASE}/categories`,
    detail: (id: number) => `${API_BASE}/categories/${id}`,
    create: `${API_BASE}/categories`,
    update: (id: number) => `${API_BASE}/categories/${id}`,
    delete: (id: number) => `${API_BASE}/categories/${id}`,
    subcategories: (catId: number) => `${API_BASE}/categories/${catId}/subcategories`,
    subcategory: (subId: number) => `${API_BASE}/categories/subcategories/${subId}`,
  },

  // ─── Products ─────────────────────────────────────────────────────────────
  products: {
    list: `${API_BASE}/products`,
    detail: (id: number) => `${API_BASE}/products/${id}`,
  },

  // ─── Cart ─────────────────────────────────────────────────────────────────
  cart: {
    root: `${API_BASE}/cart`,
    items: `${API_BASE}/cart/items`,
    item: (itemId: number) => `${API_BASE}/cart/items/${itemId}`,
  },

  // ─── Orders ───────────────────────────────────────────────────────────────
  orders: {
    list: `${API_BASE}/orders`,
    detail: (id: number) => `${API_BASE}/orders/${id}`,
    status: (id: number) => `${API_BASE}/orders/${id}/status`,
  },

  // ─── Favourites ───────────────────────────────────────────────────────────
  favourites: {
    list: `${API_BASE}/favourites`,
    detail: (id: number) => `${API_BASE}/favourites/${id}`,
  },

  // ─── Promos ───────────────────────────────────────────────────────────────
  promos: {
    validate: `${API_BASE}/promos/validate`,
  },

  // ─── Payments ─────────────────────────────────────────────────────────────
  payments: {
    info: `${API_BASE}/payments/info`,
  },

  // ─── Locations ──────────────────────────────────────────────────────────────
  // Now handled by Next.js API route instead of Python backend
  locations: {
    cities:          '/api/locations/cities',
    zones:  (cityId: number) => `/api/locations/zones/${cityId}`,
    areas:  (zoneId: number) => `/api/locations/areas/${zoneId}`,
  },

  // ─── Files ────────────────────────────────────────────────────────────────
  // Now handled by Next.js API route instead of Python backend
  files: {
    upload: (folder: string) => `/api/files/upload?folder=${folder}`,
  },

  // ─── Admin ────────────────────────────────────────────────────────────────
  admin: {
    analytics: {
      dashboard: `${API_BASE}/admin/analytics/dashboard`,
      dailySales: `${API_BASE}/admin/analytics/daily-sales`,
      productSales: `${API_BASE}/admin/analytics/product-sales`,
      promoSales: `${API_BASE}/admin/analytics/promo-sales`,
    },
    products: {
      variants: `${API_BASE}/admin/products`,
      variant: (variantId: number) => `${API_BASE}/admin/products/${variantId}`,
      inventory: (variantId: number) => `${API_BASE}/admin/products/${variantId}/inventory`,
    },
    promos: {
      list: `${API_BASE}/admin/promos`,
      detail: (id: number) => `${API_BASE}/admin/promos/${id}`,
    },
    orders: {
      status: (id: number) => `${API_BASE}/orders/${id}/status`,
    },
    auditLogs: `${API_BASE}/admin/audit-logs`,
    memos: {
      generate: (orderId: number) => `${API_BASE}/admin/memos/generate/${orderId}`,
      detail: (memoId: number) => `${API_BASE}/admin/memos/${memoId}`,
    },
  },
} as const;
