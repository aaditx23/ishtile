import { convex } from '@/infrastructure/convex/convexClient';
import { api } from '../../../convex/_generated/api';
import { requireConvexUserId } from '@/infrastructure/convex/convexAuth';
import { tokenStore } from '@/infrastructure/auth/tokenStore';
import { getBaseUrl } from '@/shared/config/baseUrl';

export interface PathaoStore {
  storeId: number;
  storeName: string;
  contactNumber: string;
  address: string;
  cityId: number;
  zoneId: number;
  areaId: number;
  isActive: boolean;
  createdAt: number;
}

export interface PathaoStoreForm {
  storeName: string;
  contactNumber: string;
  address: string;
  cityId: number;
  zoneId: number;
  areaId: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapStore(raw: any): PathaoStore {
  return {
    storeId: Number(raw.storeId),
    storeName: String(raw.storeName ?? raw.name ?? ''),
    contactNumber: String(raw.contactNumber ?? ''),
    address: String(raw.address ?? ''),
    cityId: Number(raw.cityId ?? 0),
    zoneId: Number(raw.zoneId ?? 0),
    areaId: Number(raw.areaId ?? 0),
    isActive: Boolean(raw.isActive),
    createdAt: Number(raw.createdAt ?? 0),
  };
}

export async function listPathaoStores(): Promise<PathaoStore[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stores = await convex.query((api as any).shipments.queries.listPathaoStores, {});
  return stores.map(mapStore);
}

export async function getActivePathaoStore(): Promise<PathaoStore | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const store = await convex.query((api as any).shipments.queries.getActivePathaoStore, {});
  return store ? mapStore(store) : null;
}

export async function createPathaoStoreConfig(payload: PathaoStoreForm): Promise<void> {
  const token = tokenStore.getAccess();
  if (!token) throw new Error('Not authenticated');

  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/api/admin/pathao/stores`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok || !json?.success) {
    throw new Error(json?.message ?? 'Failed to create Pathao store');
  }
}

export async function updatePathaoStoreConfig(storeId: number, payload: PathaoStoreForm): Promise<void> {
  const adminUserId = requireConvexUserId();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await convex.mutation((api as any).shipments.mutations.updatePathaoStore, {
    storeId,
    storeName: payload.storeName,
    contactNumber: payload.contactNumber,
    address: payload.address,
    cityId: payload.cityId,
    zoneId: payload.zoneId,
    areaId: payload.areaId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adminUserId: adminUserId as any,
  });
}

export async function setActivePathaoStore(storeId: number): Promise<void> {
  const adminUserId = requireConvexUserId();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await convex.mutation((api as any).shipments.mutations.setActivePathaoStore, {
    storeId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adminUserId: adminUserId as any,
  });
}
