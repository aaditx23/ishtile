import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';
import { createPathaoStore } from '@/lib/pathao';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface ResolvePathaoStoreInput {
  fallbackName: string;
  fallbackPhone: string;
  fallbackAddress: string;
  fallbackCityId: number;
  fallbackZoneId: number;
  fallbackAreaId: number;
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

export async function resolvePathaoStoreId(input: ResolvePathaoStoreInput): Promise<number> {
  const envStoreId = toNumber(process.env.PATHAO_STORE_ID);

  if (envStoreId) {
    await convex.mutation((api as any).shipments.mutations.upsertPathaoStore, {
      storeId: envStoreId,
      name: process.env.PATHAO_STORE_NAME?.trim() || input.fallbackName,
      cityId: input.fallbackCityId,
      zoneId: input.fallbackZoneId,
      areaId: input.fallbackAreaId,
      contactNumber: process.env.PATHAO_STORE_CONTACT_NUMBER?.trim() || input.fallbackPhone,
      address: process.env.PATHAO_STORE_ADDRESS?.trim() || input.fallbackAddress,
      isActive: true,
    });
    return envStoreId;
  }

  const existing = await convex.query((api as any).shipments.queries.getActivePathaoStore, {});
  if (existing?.storeId) return existing.storeId;

  const created = await createPathaoStore({
    name: process.env.PATHAO_STORE_NAME?.trim() || input.fallbackName,
    contact_name: process.env.PATHAO_STORE_CONTACT_NAME?.trim() || input.fallbackName,
    contact_number: process.env.PATHAO_STORE_CONTACT_NUMBER?.trim() || input.fallbackPhone,
    address: process.env.PATHAO_STORE_ADDRESS?.trim() || input.fallbackAddress,
    city_id: input.fallbackCityId,
    zone_id: input.fallbackZoneId,
    area_id: input.fallbackAreaId,
  });

  const createdStoreId = readCreatedStoreId(created);
  if (!createdStoreId) {
    throw new Error('Pathao store creation succeeded but store ID was not returned');
  }

  await convex.mutation((api as any).shipments.mutations.upsertPathaoStore, {
    storeId: createdStoreId,
    name: process.env.PATHAO_STORE_NAME?.trim() || input.fallbackName,
    cityId: input.fallbackCityId,
    zoneId: input.fallbackZoneId,
    areaId: input.fallbackAreaId,
    contactNumber: process.env.PATHAO_STORE_CONTACT_NUMBER?.trim() || input.fallbackPhone,
    address: process.env.PATHAO_STORE_ADDRESS?.trim() || input.fallbackAddress,
    isActive: true,
  });

  return createdStoreId;
}
