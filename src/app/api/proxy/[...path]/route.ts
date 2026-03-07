/**
 * Catch-all reverse proxy to the backend API.
 *
 * Why this exists:
 *   Browser fetch calls are subject to CORS. Rather than requiring the backend
 *   to whitelist every frontend origin, all client-side API calls are routed to
 *   /api/proxy/... (same origin → no CORS). Next.js then forwards the request
 *   to the real backend server-to-server, where CORS does not apply.
 *
 *   Server Components and Server Actions still call the backend directly via
 *   API_URL (not NEXT_PUBLIC_), so this proxy is only hit from the browser.
 */

import { type NextRequest, NextResponse } from 'next/server';

const BACKEND = (process.env.API_URL ?? 'http://localhost:8000').replace(/\/$/, '');

// Headers that must not be forwarded to the upstream server
const HOP_BY_HOP = new Set([
  'host',
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
]);

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const { path } = await params;
  const upstream = `${BACKEND}/api/v1/${path.join('/')}${req.nextUrl.search}`;

  // Forward request headers, stripping hop-by-hop and host
  const forwardHeaders = new Headers();
  req.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      forwardHeaders.set(key, value);
    }
  });

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const body = hasBody ? await req.arrayBuffer() : undefined;

  console.log('[proxy] -->', req.method, upstream);
  console.log('[proxy] headers:', Object.fromEntries(forwardHeaders.entries()));
  if (body && body.byteLength > 0) {
    console.log('[proxy] body:', new TextDecoder().decode(body));
  } else {
    console.log('[proxy] body: EMPTY');
  }

  const upstream_res = await fetch(upstream, {
    method:  req.method,
    headers: forwardHeaders,
    body:    body && body.byteLength > 0 ? body : undefined,
  });

  console.log('[proxy] <--', upstream_res.status);

  // Forward response headers, stripping hop-by-hop
  const resHeaders = new Headers();
  upstream_res.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      resHeaders.set(key, value);
    }
  });

  return new NextResponse(upstream_res.body, {
    status:  upstream_res.status,
    headers: resHeaders,
  });
}

export const GET     = handler;
export const POST    = handler;
export const PUT     = handler;
export const PATCH   = handler;
export const DELETE  = handler;
