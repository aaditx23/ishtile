/**
 * Client-side token storage.
 *
 * ┌─────────────────┬──────────────────┬──────────────────────────────────────┐
 * │ Token           │ Storage          │ Reason                               │
 * ├─────────────────┼──────────────────┼──────────────────────────────────────┤
 * │ Access token    │ Memory only      │ Never touches the DOM — invisible to  │
 * │                 │                  │ XSS. Lost on page refresh; silently   │
 * │                 │                  │ restored via refresh token.           │
 * ├─────────────────┼──────────────────┼──────────────────────────────────────┤
 * │ Refresh token   │ localStorage     │ Pragmatic. Ideal fix: proxy auth      │
 * │                 │                  │ through a Next.js API route and store  │
 * │                 │                  │ it in an httpOnly SameSite=Strict     │
 * │                 │                  │ cookie instead.                       │
 * ├─────────────────┼──────────────────┼──────────────────────────────────────┤
 * │ Session flag    │ SameSite=Lax     │ Non-secret presence cookie read by    │
 * │ (ishtile_sess)  │ cookie (JS-set)  │ middleware for server-side redirects. │
 * │                 │                  │ Does NOT contain the JWT.            │
 * └─────────────────┴──────────────────┴──────────────────────────────────────┘
 *
 * IMPORTANT: This module must only be used in client-side code.
 */

const KEYS = {
  refresh: 'ishtile_rt',
  session: 'ishtile_sess', // cookie name — read by middleware
} as const;

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

// ─── Session flag cookie (non-secret, middleware-readable) ────────────────────

function setSessionCookie(): void {
  // SameSite=Lax prevents the cookie from being sent on cross-site POSTs
  // (basic CSRF protection). Secure flag added automatically in production.
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${KEYS.session}=1; path=/; SameSite=Lax${secure}`;
}

function clearSessionCookie(): void {
  document.cookie = `${KEYS.session}=; path=/; max-age=0; SameSite=Lax`;
}

// ─── In-memory access token ───────────────────────────────────────────────────

let _access: string | null = null;

// ─── Store ────────────────────────────────────────────────────────────────────

export const tokenStore = {
  // ─── Access token (memory only) ─────────────────────────────────────────────
  getAccess(): string | null {
    return _access;
  },

  setAccess(token: string): void {
    _access = token;
  },

  clearAccess(): void {
    _access = null;
  },

  // ─── Refresh token (localStorage) ───────────────────────────────────────────
  getRefresh(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(KEYS.refresh);
  },

  setRefresh(token: string): void {
    if (!isBrowser()) return;
    localStorage.setItem(KEYS.refresh, token);
  },

  clearRefresh(): void {
    if (!isBrowser()) return;
    localStorage.removeItem(KEYS.refresh);
  },

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  /** Call after any successful login / token refresh. */
  setTokens(accessToken: string, refreshToken: string): void {
    this.setAccess(accessToken);
    this.setRefresh(refreshToken);
    if (isBrowser()) setSessionCookie();
  },

  /** Clear everything and remove the session cookie so middleware redirects. */
  clearAll(): void {
    this.clearAccess();
    this.clearRefresh();
    if (isBrowser()) clearSessionCookie();
  },

  isAuthenticated(): boolean {
    return _access !== null;
  },
};
