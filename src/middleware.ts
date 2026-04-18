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

async function isSessionTokenValid(token: string): Promise<boolean> {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return false;

    const { jwtVerify } = await import('jose');
    const encodedSecret = new TextEncoder().encode(secret);
    await jwtVerify(token, encodedSecret);
    return true;
  } catch {
    return false;
  }
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if user has session cookie (set by client-side auth)
  const sessionCookie = request.cookies.get('Ishtile_sess');
  const sessionToken = sessionCookie?.value ?? '';
  const hasSessionToken = sessionToken.length > 0;

  // Check if current path is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );

  // Check if current path is an auth route (login, register)
  const isAuthRoute = AUTH_ROUTES.some(route => 
    pathname.startsWith(route)
  );

  // True auth gate: verify JWT signature + expiry for protected routes.
  if (isProtectedRoute && hasSessionToken) {
    const valid = await isSessionTokenValid(sessionToken);

    if (!valid) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      loginUrl.searchParams.set('reason', 'expired');

      const res = NextResponse.redirect(loginUrl);
      // Hard logout path for stale/invalid token: remove middleware session cookie.
      res.cookies.set('Ishtile_sess', '', {
        path: '/',
        maxAge: 0,
        sameSite: 'lax',
      });
      return res;
    }
  }

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !hasSessionToken) {
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
