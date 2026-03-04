import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── Route groups ─────────────────────────────────────────────────────────────

const BUYER_PREFIX   = '/buyer';
const ADMIN_PREFIX   = '/admin';
const CART_PATH      = '/cart';
const CHECKOUT_PATH  = '/checkout';
const ORDERS_PREFIX  = '/orders';
const LOGIN_PATH     = '/login';
const SESSION_COOKIE = 'ishtile_sess';

function isProtectedBuyer(pathname: string): boolean {
  return pathname.startsWith(BUYER_PREFIX);
}

function isProtectedAdmin(pathname: string): boolean {
  return pathname.startsWith(ADMIN_PREFIX);
}

function isProtectedShop(pathname: string): boolean {
  return pathname === CART_PATH || pathname.startsWith(CHECKOUT_PATH) || pathname.startsWith(ORDERS_PREFIX);
}

function isAuthPage(pathname: string): boolean {
  return pathname.startsWith(LOGIN_PATH) || pathname.startsWith('/register');
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  // Redirect unauthenticated users away from protected routes
  if ((isProtectedBuyer(pathname) || isProtectedAdmin(pathname) || isProtectedShop(pathname)) && !hasSession) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = LOGIN_PATH;
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from the login page
  if (isAuthPage(pathname) && hasSession) {
    const homeUrl = request.nextUrl.clone();
    homeUrl.pathname = '/';
    homeUrl.searchParams.delete('next');
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     *  - _next/static  (static assets)
     *  - _next/image   (image optimisation)
     *  - favicon.ico
     *  - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
