/**
 * Pathao Locations API Proxy with 1-hour in-memory cache
 *
 * GET /api/locations/cities
 * GET /api/locations/zones/[cityId]
 * GET /api/locations/areas/[zoneId]
 *
 * Replaces the Python backend's /locations endpoints.
 * Calls Pathao API directly with Bearer token and caches responses.
 */
import { NextRequest, NextResponse } from 'next/server';

const PATHAO_BASE_URL = process.env.PATHAO_BASE_URL!;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CacheEntry {
  data: unknown[];
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

// ─── Pathao Token Management ──────────────────────────────────────────────────

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getPathaoToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }

  const res = await fetch(`${PATHAO_BASE_URL}/aladdin/api/v1/issue-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.PATHAO_CLIENT_ID,
      client_secret: process.env.PATHAO_CLIENT_SECRET,
      username: process.env.PATHAO_USERNAME,
      password: process.env.PATHAO_PASSWORD,
      grant_type: 'password',
    }),
  });

  if (!res.ok) {
    throw new Error(`Pathao auth failed: ${res.status}`);
  }

  const json = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };

  cachedToken = {
    token: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };

  return cachedToken.token;
}

// ─── Pathao API Calls ─────────────────────────────────────────────────────────

async function fetchFromPathao(path: string): Promise<unknown[]> {
  const token = await getPathaoToken();
  const res = await fetch(`${PATHAO_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Pathao API error: ${res.status}`);
  }

  // Pathao response structure: { code: 200, data: { data: [...], total: N } }
  const json = (await res.json()) as { data: { data: unknown[] } };
  return json.data?.data ?? [];
}

async function getCities(): Promise<unknown[]> {
  const key = 'cities';
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const data = await fetchFromPathao('/aladdin/api/v1/countries/1/city-list');
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}

async function getZones(cityId: string): Promise<unknown[]> {
  const key = `zones:${cityId}`;
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const data = await fetchFromPathao(`/aladdin/api/v1/cities/${cityId}/zone-list`);
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}

async function getAreas(zoneId: string): Promise<unknown[]> {
  const key = `areas:${zoneId}`;
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const data = await fetchFromPathao(`/aladdin/api/v1/zones/${zoneId}/area-list`);
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<NextResponse> {
  const { path } = await params;

  try {
    let data: unknown[];

    if (path.length === 1 && path[0] === 'cities') {
      data = await getCities();
    } else if (path.length === 2 && path[0] === 'zones') {
      data = await getZones(path[1]);
    } else if (path.length === 2 && path[0] === 'areas') {
      data = await getAreas(path[1]);
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid path', data: null, listData: null },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Retrieved successfully',
      data: null,
      listData: data,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Pathao API request failed';
    return NextResponse.json(
      { success: false, message, data: null, listData: null },
      { status: 503 },
    );
  }
}
