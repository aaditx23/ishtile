import { convex } from '@/infrastructure/convex/convexClient';
import { apiClient } from '@/infrastructure/api/apiClient';
import { ENDPOINTS } from '@/infrastructure/api/endpoints';
import { api } from '../../../convex/_generated/api';

export type HeroContentPosition = 'left' | 'right';

export interface HeroImageRecord {
  id: string;
  url: string;
  title: string;
  subtitle: string | null;
  contentPosition: HeroContentPosition;
  showButton: boolean;
  buttonText: string | null;
  buttonUrl: string | null;
  isActive: boolean;
  createdAt: number;
  updatedAt: number | null;
}

export interface HeroImagePayload {
  url: string;
  title: string;
  subtitle?: string;
  contentPosition: HeroContentPosition;
  showButton: boolean;
  buttonText?: string;
  buttonUrl?: string;
  isActive: boolean;
}

function normalizeOptional(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapHero(raw: any): HeroImageRecord {
  return {
    id: String(raw.id),
    url: String(raw.url ?? ''),
    title: String(raw.title ?? ''),
    subtitle: raw.subtitle ? String(raw.subtitle) : null,
    contentPosition: raw.contentPosition === 'right' ? 'right' : 'left',
    showButton: Boolean(raw.showButton),
    buttonText: raw.buttonText ? String(raw.buttonText) : null,
    buttonUrl: raw.buttonUrl ? String(raw.buttonUrl) : null,
    isActive: Boolean(raw.isActive),
    createdAt: Number(raw.createdAt ?? 0),
    updatedAt: raw.updatedAt ? Number(raw.updatedAt) : null,
  };
}

export async function listHeroImages(): Promise<HeroImageRecord[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await convex.query((api as any).admin.queries.listHeroImages, {});
  return rows.map(mapHero);
}

export async function createHeroImage(payload: HeroImagePayload): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await convex.mutation((api as any).admin.mutations.createHeroImage, {
    url: payload.url,
    title: payload.title,
    subtitle: normalizeOptional(payload.subtitle),
    contentPosition: payload.contentPosition,
    showButton: payload.showButton,
    buttonText: normalizeOptional(payload.buttonText),
    buttonUrl: normalizeOptional(payload.buttonUrl),
    isActive: payload.isActive,
  });
}

export async function updateHeroImage(heroImageId: string, payload: HeroImagePayload): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await convex.mutation((api as any).admin.mutations.updateHeroImage, {
    heroImageId: heroImageId as any,
    url: payload.url,
    title: payload.title,
    subtitle: normalizeOptional(payload.subtitle),
    contentPosition: payload.contentPosition,
    showButton: payload.showButton,
    buttonText: normalizeOptional(payload.buttonText),
    buttonUrl: normalizeOptional(payload.buttonUrl),
    isActive: payload.isActive,
  });
}

export async function setHeroImageActive(heroImageId: string, isActive: boolean): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await convex.mutation((api as any).admin.mutations.setHeroImageActive, {
    heroImageId: heroImageId as any,
    isActive,
  });
}

export async function deleteHeroImage(heroImageId: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await convex.mutation((api as any).admin.mutations.deleteHeroImage, {
    heroImageId: heroImageId as any,
  });
}

export async function uploadHeroImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('files', file);

  const res = await apiClient.postFormData<{ success: boolean; message: string; listData?: unknown }>(
    ENDPOINTS.files.upload('hero-images'),
    formData,
  );

  const urls = Array.isArray(res.listData) ? res.listData : [];
  const first = urls[0];
  if (typeof first !== 'string' || first.length === 0) {
    throw new Error('Image upload failed');
  }

  return first;
}
