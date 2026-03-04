const BASE = process.env.NEXT_PUBLIC_API_URL!.replace(/\/$/, '');

export const API_BASE = `${BASE}/api/v1`;

export const ENDPOINTS = {
  // ─── Auth ─────────────────────────────────────────────────────────────────
  auth: {
    requestOtp: `${API_BASE}/auth/request-otp`,
    verifyOtp:  `${API_BASE}/auth/verify-otp`,
    login:      `${API_BASE}/auth/login`,
    register:   `${API_BASE}/auth/register`,
    refresh:    `${API_BASE}/auth/refresh`,
  },

  // ─── Users ────────────────────────────────────────────────────────────────
  users: {
    me:         `${API_BASE}/users/me`,
  },

  // ─── Categories ───────────────────────────────────────────────────────────
  categories: {
    list:       `${API_BASE}/categories`,
    detail:     (id: number) => `${API_BASE}/categories/${id}`,
  },

  // ─── Products ─────────────────────────────────────────────────────────────
  products: {
    list:       `${API_BASE}/products`,
    detail:     (id: number) => `${API_BASE}/products/${id}`,
  },

  // ─── Cart ─────────────────────────────────────────────────────────────────
  cart: {
    root:       `${API_BASE}/cart`,
    items:      `${API_BASE}/cart/items`,
    item:       (itemId: number) => `${API_BASE}/cart/items/${itemId}`,
  },

  // ─── Orders ───────────────────────────────────────────────────────────────
  orders: {
    list:       `${API_BASE}/orders`,
    detail:     (id: number) => `${API_BASE}/orders/${id}`,
    status:     (id: number) => `${API_BASE}/orders/${id}/status`,
  },

  // ─── Favourites ───────────────────────────────────────────────────────────
  favourites: {
    list:       `${API_BASE}/favourites`,
    detail:     (id: number) => `${API_BASE}/favourites/${id}`,
  },

  // ─── Promos ───────────────────────────────────────────────────────────────
  promos: {
    validate:   `${API_BASE}/promos/validate`,
  },

  // ─── Payments ─────────────────────────────────────────────────────────────
  payments: {
    info:       `${API_BASE}/payments/info`,
  },

  // ─── Admin ────────────────────────────────────────────────────────────────
  admin: {
    analytics: {
      dashboard:    `${API_BASE}/admin/analytics/dashboard`,
      dailySales:   `${API_BASE}/admin/analytics/daily-sales`,
      productSales: `${API_BASE}/admin/analytics/product-sales`,
      promoSales:   `${API_BASE}/admin/analytics/promo-sales`,
    },
    products: {
      variants:         `${API_BASE}/admin/products`,
      variant:          (variantId: number) => `${API_BASE}/admin/products/${variantId}`,
      inventory:        (variantId: number) => `${API_BASE}/admin/products/${variantId}/inventory`,
    },
    promos: {
      list:   `${API_BASE}/admin/promos`,
      detail: (id: number) => `${API_BASE}/admin/promos/${id}`,
    },
    orders: {
      status: (id: number) => `${API_BASE}/orders/${id}/status`,
    },
    auditLogs: `${API_BASE}/admin/audit-logs`,
    memos: {
      generate: (orderId: number) => `${API_BASE}/admin/memos/generate/${orderId}`,
      detail:   (memoId: number)  => `${API_BASE}/admin/memos/${memoId}`,
    },
  },
} as const;
