import type { ApiResponse } from '@/shared/types/api.types';
import { ENDPOINTS } from './endpoints';
import { tokenStore } from '@/infrastructure/auth/tokenStore';

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
  const qs = Object.entries(params)
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

async function tryRefreshTokens(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return false;

  try {
    const res = await fetch(ENDPOINTS.auth.refresh, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return false;

    const json = await res.json() as { token?: string };
    if (json.token) {
      tokenStore.setAccess(json.token);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

// ─── Core request ─────────────────────────────────────────────────────────────

async function request<T extends AnyApiResponse>(
  method: Method,
  url: string,
  body?: unknown,
  options: RequestOptions = {},
  _isRetry = false,
): Promise<T> {
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
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });

    // Handle 401 → try silent refresh once
    if (res.status === 401 && !_isRetry) {
      const refreshed = await tryRefreshTokens();
      if (refreshed) {
        return request<T>(method, url, body, options, true);
      }
      // Refresh failed — clear tokens so UI knows session ended
      tokenStore.clearAll();
    }

    const json = await res.json() as T & { data?: { errors?: string[] } };

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
