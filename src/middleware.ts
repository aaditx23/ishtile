import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── Protected Routes Configuration ───────────────────────────────────────────

const PROTECTED_ROUTES = [
  '/admin',
  '/profile',
  '/favourites',
  '/orders',
  '/checkout',
];

const AUTH_ROUTES = [
  '/login',
  '/register',
];

// ─── Middleware ───────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if user has session cookie (set by client-side auth)
  const sessionCookie = request.cookies.get('Ishtile_sess');
  const isAuthenticated = !!sessionCookie?.value;

  // Check if current path is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );

  // Check if current path is an auth route (login, register)
  const isAuthRoute = AUTH_ROUTES.some(route => 
    pathname.startsWith(route)
  );

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Never block access to auth routes from middleware — the login/register
  // pages handle "already authenticated" state client-side. A stale
  // Ishtile_sess cookie (JWT expired but cookie still alive) would otherwise
  // trap users in a redirect loop they can never escape.

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images|api).*)'],
};
