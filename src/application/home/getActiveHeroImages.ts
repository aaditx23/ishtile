import { convex } from '@/infrastructure/convex/convexClient';
import { api } from '../../../convex/_generated/api';

export interface HeroImageData {
  id: string;
  url: string;
  title: string;
  subtitle: string | null;
  contentPosition: 'left' | 'right';
  showButton: boolean;
  buttonText: string | null;
  buttonUrl: string | null;
  isActive: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapHero(raw: any): HeroImageData {
  const position = raw.contentPosition ?? raw.contentAlign;
  return {
    id: String(raw.id),
    url: String(raw.url ?? ''),
    title: String(raw.title ?? ''),
    subtitle: typeof raw.subtitle === 'string' ? raw.subtitle : null,
    contentPosition: position === 'right' ? 'right' : 'left',
    showButton: Boolean(raw.showButton),
    buttonText: typeof raw.buttonText === 'string' ? raw.buttonText : null,
    buttonUrl: typeof raw.buttonUrl === 'string' ? raw.buttonUrl : null,
    isActive: Boolean(raw.isActive),
  };
}

export async function getActiveHeroImages(): Promise<HeroImageData[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = await convex.query((api as any).admin.queries.getActiveHeroImages, {});
  return rows.map(mapHero);
}
