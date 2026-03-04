import type { ApiResponse } from '@/shared/types/api.types';
import { ENDPOINTS } from './endpoints';
import { tokenStore } from '@/infrastructure/auth/tokenStore';
import { toCamelCase, toSnakeCase } from './caseConverters';

// ─── Error ────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: string[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  /** Explicit token override — use this in server-side calls */
  token?: string;
  /** Additional query params appended to the URL */
  params?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
  /** Request timeout in milliseconds. Defaults to 15 000. Pass 0 to disable. */
  timeout?: number;
}

/**
 * Minimal structural constraint for the generic parameter.
 * Concrete response types (DataResponse<T>, PaginatedResponse<T>, etc.)
 * all carry at least these two fields.
 */
type AnyApiResponse = Pick<ApiResponse, 'success' | 'message'>;

// ─── Internal helpers ─────────────────────────────────────────────────────────

function buildUrl(
  url: string,
  params?: RequestOptions['params'],
): string {
  if (!params) return url;
  const snakeParams = toSnakeCase(params) as Record<string, string | number | boolean | undefined | null>;
  const qs = Object.entries(snakeParams)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `${url}?${qs}` : url;
}

function getToken(override?: string): string | null {
  if (override) return override;
  // browser: use store; server: no token by default (caller must pass override)
  if (typeof window !== 'undefined') return tokenStore.getAccess();
  return null;
}

// ─── Singleton refresh lock ───────────────────────────────────────────────────
// Ensures concurrent 401 responses share ONE refresh call instead of each
// burning the refresh token independently (which would fail on single-use tokens).
let _refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return false;

  try {
    const res = await fetch(ENDPOINTS.auth.refresh, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toSnakeCase({ refreshToken })),
    });

    if (!res.ok) return false;

    const json = toCamelCase(await res.json()) as { token?: string };
    if (json.token) {
      tokenStore.setAccess(json.token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

async function tryRefreshTokens(): Promise<boolean> {
  // If a refresh is already in-flight, wait for that same promise.
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = doRefresh().finally(() => {
    _refreshPromise = null;
  });
  return _refreshPromise;
}

// ─── Core request ─────────────────────────────────────────────────────────────

async function request<T extends AnyApiResponse>(
  method: Method,
  url: string,
  body?: unknown,
  options: RequestOptions = {},
  _isRetry = false,
): Promise<T> {
  // Proactive restore: access token is memory-only and lost on every page load.
  // If it's absent but a refresh token exists, silently obtain a new access
  // token BEFORE sending the request so the first call always has auth.
  if (!options.token && !tokenStore.getAccess() && tokenStore.getRefresh() && !_isRetry) {
    await tryRefreshTokens();
  }

  const token = getToken(options.token);
  const fullUrl = buildUrl(url, options.params);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    // Tells the server this is a fetch/XHR request, not a plain browser navigation.
    // Helps distinguish AJAX from form submissions for CSRF mitigation.
    'X-Requested-With': 'XMLHttpRequest',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // Per-request timeout — default 15 s. Pass timeout: 0 to disable.
  const timeoutMs = options.timeout ?? 15_000;
  const timeoutController = timeoutMs > 0 ? new AbortController() : null;
  const timeoutId = timeoutController
    ? setTimeout(() => timeoutController.abort(), timeoutMs)
    : null;

  // Merge timeout signal with any caller-supplied signal
  const signals = [timeoutController?.signal, options.signal].filter(
    Boolean,
  ) as AbortSignal[];
  const signal = signals.length > 1 ? AbortSignal.any(signals) : signals[0];

  try {
    const res = await fetch(fullUrl, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(toSnakeCase(body)) : undefined,
      signal,
    });

    // Handle 401/403 → try silent refresh once.
    // Backend returns 403 (not 401) for missing/expired tokens.
    if ((res.status === 401 || res.status === 403) && !_isRetry) {
      const refreshed = await tryRefreshTokens();
      if (refreshed) {
        return request<T>(method, url, body, options, true);
      }
      // Refresh failed — clear tokens so UI knows session ended
      tokenStore.clearAll();
    }

    const json = toCamelCase(await res.json()) as T & { data?: { errors?: string[] } };

    if (!res.ok || !json.success) {
      const errBody = json as unknown as { data?: { errors?: string[] }; message: string };
      // Never leak internal server details to the UI
      const userMessage =
        res.status >= 500
          ? 'Something went wrong. Please try again later.'
          : (errBody.message ?? 'Request failed.');
      throw new ApiError(res.status, userMessage, errBody.data?.errors);
    }

    return json as T;
  } finally {
    if (timeoutId !== null) clearTimeout(timeoutId);
  }
}

// ─── Public client ────────────────────────────────────────────────────────────

export const apiClient = {
  get<T extends AnyApiResponse>(url: string, opts?: RequestOptions): Promise<T> {
    return request<T>('GET', url, undefined, opts);
  },

  post<T extends AnyApiResponse>(url: string, body?: unknown, opts?: RequestOptions): Promise<T> {
    return request<T>('POST', url, body, opts);
  },

  put<T extends AnyApiResponse>(url: string, body?: unknown, opts?: RequestOptions): Promise<T> {
    return request<T>('PUT', url, body, opts);
  },

  patch<T extends AnyApiResponse>(url: string, body?: unknown, opts?: RequestOptions): Promise<T> {
    return request<T>('PATCH', url, body, opts);
  },

  delete<T extends AnyApiResponse>(url: string, opts?: RequestOptions): Promise<T> {
    return request<T>('DELETE', url, undefined, opts);
  },
};
