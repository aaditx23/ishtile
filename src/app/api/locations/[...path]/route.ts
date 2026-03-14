/**
 * Pathao Locations API Proxy with 1-hour in-memory cache.
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  getAreas as getPathaoAreas,
  getCities as getPathaoCities,
  getZones as getPathaoZones,
} from '@/lib/pathao';

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CacheEntry {
  data: unknown[];
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

async function getCitiesCached(): Promise<unknown[]> {
  const key = 'cities';
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const response = await getPathaoCities();
  const data = response.data?.data ?? [];
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}

async function getZonesCached(cityId: string): Promise<unknown[]> {
  const key = `zones:${cityId}`;
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const response = await getPathaoZones(Number(cityId));
  const data = response.data?.data ?? [];
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
  return data;
}

async function getAreasCached(zoneId: string): Promise<unknown[]> {
  const key = `areas:${zoneId}`;
  const cached = cache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const response = await getPathaoAreas(Number(zoneId));
  const data = response.data?.data ?? [];
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
      data = await getCitiesCached();
    } else if (path.length === 2 && path[0] === 'zones') {
      data = await getZonesCached(path[1]);
    } else if (path.length === 2 && path[0] === 'areas') {
      data = await getAreasCached(path[1]);
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
