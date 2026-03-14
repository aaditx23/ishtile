import { NextRequest, NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import type { Id } from '../../../../../../convex/_generated/dataModel';
import { api } from '../../../../../../convex/_generated/api';
import { verifyToken } from '@/lib/auth';
import { createPathaoStore, listPathaoRemoteStores } from '@/lib/pathao';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface CreateStoreBody {
  storeName?: string;
  contactNumber?: string;
  address?: string;
  cityId?: number;
  zoneId?: number;
  areaId?: number;
}

interface AddStoreFromResponseBody {
  storeId?: number;
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

function normalizeText(value: unknown): string {
  return String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

function readRemoteStoreList(response: unknown): Array<Record<string, unknown>> {
  if (!response || typeof response !== 'object') return [];
  const root = response as Record<string, unknown>;
  const data = root.data as Record<string, unknown> | undefined;
  const rows = Array.isArray(data?.data)
    ? data?.data
    : Array.isArray(data?.stores)
      ? data?.stores
      : [];
  return rows as Array<Record<string, unknown>>;
}

function mapRemoteStore(raw: Record<string, unknown>) {
  return {
    storeId: Number(raw.store_id ?? raw.id ?? 0),
    storeName: String(raw.store_name ?? raw.name ?? ''),
    storeAddress: String(raw.store_address ?? raw.address ?? ''),
    contactNumber: String(raw.contact_number ?? ''),
    cityId: Number(raw.city_id ?? 0),
    zoneId: Number(raw.zone_id ?? 0),
    isActive: Number(raw.is_active ?? 0),
  };
}

function buildPathaoErrorMessage(response: unknown, fallback: string): string {
  if (!response || typeof response !== 'object') return fallback;

  const root = response as Record<string, unknown>;
  const baseMessage = typeof root.message === 'string' && root.message.trim()
    ? root.message.trim()
    : fallback;

  const errors = root.errors;
  if (!errors || typeof errors !== 'object') return baseMessage;

  const list: string[] = [];
  for (const value of Object.values(errors as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'string' && item.trim()) list.push(item.trim());
      }
    } else if (typeof value === 'string' && value.trim()) {
      list.push(value.trim());
    }
  }

  if (list.length === 0) return baseMessage;
  return `${baseMessage}: ${list.join(', ')}`;
}

function isStoreValid(remote: ReturnType<typeof mapRemoteStore>, db: Record<string, unknown>): boolean {
  const remoteName = normalizeText(remote.storeName);
  const dbName = normalizeText(db.storeName ?? db.name);

  const remoteAddress = normalizeText(remote.storeAddress);
  const dbAddress = normalizeText(db.address);

  const remoteCityId = Number(remote.cityId ?? 0);
  const dbCityId = Number(db.cityId ?? 0);

  const remoteZoneId = Number(remote.zoneId ?? 0);
  const dbZoneId = Number(db.zoneId ?? 0);

  const remoteContact = normalizeText(remote.contactNumber);
  const dbContact = normalizeText(db.contactNumber);
  const contactMatches = remoteContact.length === 0 ? true : remoteContact === dbContact;

  return (
    remoteName === dbName
    && remoteAddress === dbAddress
    && remoteCityId === dbCityId
    && remoteZoneId === dbZoneId
    && contactMatches
  );
}

async function requireAdmin(req: NextRequest): Promise<{ ok: true; userId: Id<'users'> } | { ok: false; response: Response }> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      ok: false,
      response: NextResponse.json({ success: false, message: 'Unauthorized', data: null, listData: null }, { status: 401 }),
    };
  }

  const token = authHeader.substring(7);
  const payload = await verifyToken(token);
  if (!payload || payload.role !== 'admin') {
    return {
      ok: false,
      response: NextResponse.json({ success: false, message: 'Admin access required', data: null, listData: null }, { status: 403 }),
    };
  }

  return { ok: true, userId: payload.userId as Id<'users'> };
}

export async function GET(req: NextRequest): Promise<Response> {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;

    const remote = await listPathaoRemoteStores();
    const remoteRows = readRemoteStoreList(remote);
    const view = req.nextUrl.searchParams.get('view');

    if (view === 'raw') {
      return NextResponse.json({
        success: true,
        message: 'Pathao stores fetched',
        data: null,
        listData: remoteRows,
      });
    }

    const dbRows = (await convex.query((api as any).shipments.queries.listPathaoStores, {})) as Array<Record<string, unknown>>;
    const dbByStoreId = new Map<number, Record<string, unknown>>(dbRows.map((row) => [Number(row.storeId), row]));

    const listData = remoteRows
      .map(mapRemoteStore)
      .filter((store) => store.storeId > 0)
      .map((remoteStore) => {
        const db = dbByStoreId.get(remoteStore.storeId);
        if (!db) {
          return {
            ...remoteStore,
            status: 'missing' as const,
            isValid: false,
            canUse: false,
            dbAreaId: null,
            dbIsActive: false,
          };
        }

        const valid = isStoreValid(remoteStore, db);
        return {
          ...remoteStore,
          status: valid ? ('valid' as const) : ('invalid' as const),
          isValid: valid,
          canUse: valid,
          dbAreaId: Number(db.areaId ?? 0) || null,
          dbIsActive: Boolean(db.isActive),
        };
      });

    return NextResponse.json({
      success: true,
      message: 'Pathao stores compared with DB',
      data: null,
      listData,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch Pathao stores';
    return NextResponse.json({ success: false, message, data: null, listData: null }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;

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

    const createdRoot = (created && typeof created === 'object')
      ? (created as Record<string, unknown>)
      : null;
    const providerMessage = typeof createdRoot?.message === 'string'
      ? createdRoot.message
      : null;

    const storeId = readCreatedStoreId(created);
    if (!storeId) {
      return NextResponse.json({
        success: true,
        message: providerMessage ?? 'Store created successfully, Please wait one hour for approval.',
        data: {
          pendingApproval: true,
          storeId: null,
          storeName,
        },
        listData: null,
      });
    }

    const adminUserId = auth.userId;

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
      message: providerMessage ?? 'Pathao store created',
      data: {
        pendingApproval: false,
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
    const apiError = error as {
      statusCode?: number;
      response?: unknown;
      message?: string;
    };
    const fallback = error instanceof Error ? error.message : 'Failed to create Pathao store';
    const message = buildPathaoErrorMessage(apiError.response, fallback);
    const status = typeof apiError.statusCode === 'number' && apiError.statusCode >= 400
      ? apiError.statusCode
      : 500;

    return NextResponse.json({ success: false, message, data: null, listData: null }, { status });
  }
}

export async function PATCH(req: NextRequest): Promise<Response> {
  try {
    const auth = await requireAdmin(req);
    if (!auth.ok) return auth.response;

    const body = (await req.json()) as AddStoreFromResponseBody;
    const storeId = Number(body.storeId ?? 0);
    const areaId = Number(body.areaId ?? 0);

    if (!storeId || !areaId) {
      return NextResponse.json({ success: false, message: 'storeId and areaId are required', data: null, listData: null }, { status: 400 });
    }

    const [remote, dbRows] = await Promise.all([
      listPathaoRemoteStores(),
      convex.query((api as any).shipments.queries.listPathaoStores, {}),
    ]);

    const remoteMatch = readRemoteStoreList(remote)
      .map(mapRemoteStore)
      .find((row) => row.storeId === storeId);

    if (!remoteMatch) {
      return NextResponse.json({ success: false, message: 'Store not found in Pathao response', data: null, listData: null }, { status: 404 });
    }

    const existing = (dbRows as Array<Record<string, unknown>>).find((row) => Number(row.storeId) === storeId);

    await convex.mutation((api as any).shipments.mutations.createPathaoStoreRecord, {
      storeId,
      storeName: remoteMatch.storeName,
      contactNumber: remoteMatch.contactNumber || String(existing?.contactNumber ?? ''),
      address: remoteMatch.storeAddress,
      cityId: remoteMatch.cityId,
      zoneId: remoteMatch.zoneId,
      areaId,
      isActive: Boolean(existing?.isActive ?? false),
      adminUserId: auth.userId,
    });

    return NextResponse.json({
      success: true,
      message: 'Store added to DB from Pathao response',
      data: { storeId, areaId },
      listData: null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to add store from response';
    return NextResponse.json({ success: false, message, data: null, listData: null }, { status: 500 });
  }
}
