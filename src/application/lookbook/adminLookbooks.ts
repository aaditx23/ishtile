import { convex } from '@/infrastructure/convex/convexClient';
import { asId } from '@/infrastructure/convex/convexHelpers';
import { apiClient } from '@/infrastructure/api/apiClient';
import { ENDPOINTS } from '@/infrastructure/api/endpoints';
import { api } from '../../../convex/_generated/api';
import type { Lookbook } from '@/domain/lookbook/lookbook.entity';

export interface LookbookPayload {
  title: string;
  slug: string;
  body: string;
  coverImageUrl: string;
  imageUrls: string[];
  displayOrder?: number;
  isActive: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLookbook(raw: any): Lookbook {
  return {
    id: asId(raw.id ?? raw._id),
    title: String(raw.title ?? ''),
    slug: String(raw.slug ?? ''),
    body: raw.body ? String(raw.body) : null,
    coverImageUrl: String(raw.coverImageUrl ?? ''),
    imageUrls: Array.isArray(raw.imageUrls) ? raw.imageUrls.map((x: unknown) => String(x)) : [],
    displayOrder: Number(raw.displayOrder ?? 0),
    isActive: Boolean(raw.isActive),
  };
}

export async function listLookbooksForAdmin(): Promise<Lookbook[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await convex.query((api as any).lookbooks.queries.listLookbooks, {
    activeOnly: false,
    limit: 500,
  });
  return (rows ?? []).map(mapLookbook);
}

export async function createLookbook(payload: LookbookPayload): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await convex.mutation((api as any).lookbooks.mutations.createLookbook, {
    title: payload.title,
    slug: payload.slug,
    body: payload.body,
    coverImageUrl: payload.coverImageUrl,
    imageUrls: payload.imageUrls,
    displayOrder: payload.displayOrder ?? 0,
    isActive: payload.isActive,
  });
}

export async function updateLookbook(lookbookId: number, payload: LookbookPayload): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await convex.mutation((api as any).lookbooks.mutations.updateLookbook, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lookbookId: lookbookId as any,
    title: payload.title,
    slug: payload.slug,
    body: payload.body,
    coverImageUrl: payload.coverImageUrl,
    imageUrls: payload.imageUrls,
    displayOrder: payload.displayOrder ?? 0,
    isActive: payload.isActive,
  });
}

export async function deleteLookbook(lookbookId: number): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await convex.mutation((api as any).lookbooks.mutations.deleteLookbook, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    lookbookId: lookbookId as any,
  });
}

export async function uploadLookbookImages(files: File[], folder = 'lookbooks'): Promise<string[]> {
  const formData = new FormData();
  for (const file of files) formData.append('files', file);

  const res = await apiClient.postFormData<{ message?: string; listData?: unknown }>(ENDPOINTS.files.upload(folder), formData);
  const urls = Array.isArray(res.listData) ? res.listData.filter((x): x is string => typeof x === 'string' && x.length > 0) : [];

  if (urls.length !== files.length) {
    throw new Error(res.message || `Uploaded ${urls.length}/${files.length} files. Some images failed to upload.`);
  }

  return urls;
}
