import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import type { Id } from '../../../../../../convex/_generated/dataModel';
import { api } from '../../../../../../convex/_generated/api';
import { verifyToken } from '@/lib/auth';
import { createPathaoStore } from '@/lib/pathao';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface CreateStoreBody {
  storeName?: string;
  contactNumber?: string;
  address?: string;
  cityId?: number;
  zoneId?: number;
  areaId?: number;
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function readCreatedStoreId(response: unknown): number | null {
  if (!response || typeof response !== 'object') return null;
  const root = response as Record<string, unknown>;
  const data = root.data as Record<string, unknown> | undefined;
  const store = data?.store as Record<string, unknown> | undefined;

  return (
    toNumber(store?.store_id) ??
    toNumber(store?.id) ??
    toNumber(data?.store_id) ??
    toNumber(data?.id) ??
    toNumber(root.store_id) ??
    toNumber(root.id)
  );
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized', data: null, listData: null }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required', data: null, listData: null }, { status: 403 });
    }

    const body = (await req.json()) as CreateStoreBody;

    const storeName = String(body.storeName ?? '').trim();
    const contactNumber = String(body.contactNumber ?? '').trim();
    const address = String(body.address ?? '').trim();
    const cityId = Number(body.cityId);
    const zoneId = Number(body.zoneId);
    const areaId = Number(body.areaId);

    if (!storeName || !contactNumber || !address || !cityId || !zoneId || !areaId) {
      return NextResponse.json({ success: false, message: 'All store fields are required', data: null, listData: null }, { status: 400 });
    }

    const created = await createPathaoStore({
      name: storeName,
      contact_name: storeName,
      contact_number: contactNumber,
      address,
      city_id: cityId,
      zone_id: zoneId,
      area_id: areaId,
    });

    const storeId = readCreatedStoreId(created);
    if (!storeId) {
      throw new Error('Pathao store creation succeeded but no store_id returned');
    }

    const adminUserId = payload.userId as Id<'users'>;

    await convex.mutation((api as any).shipments.mutations.createPathaoStoreRecord, {
      storeId,
      storeName,
      contactNumber,
      address,
      cityId,
      zoneId,
      areaId,
      adminUserId,
    });

    return NextResponse.json({
      success: true,
      message: 'Pathao store created',
      data: {
        storeId,
        storeName,
        contactNumber,
        address,
        cityId,
        zoneId,
        areaId,
      },
      listData: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create Pathao store';
    return NextResponse.json({ success: false, message, data: null, listData: null }, { status: 500 });
  }
}
