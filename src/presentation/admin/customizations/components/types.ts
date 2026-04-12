import type {
  HeroContentPosition,
  HeroImagePayload,
  HeroImageRecord,
} from '@/application/customizations/heroCustomizations';

export interface HeroFormState {
  url: string;
  title: string;
  subtitle: string;
  contentPosition: HeroContentPosition;
  showButton: boolean;
  buttonText: string;
  buttonUrl: string;
  isActive: boolean;
}

export const INITIAL_HERO_FORM: HeroFormState = {
  url: '',
  title: '',
  subtitle: '',
  contentPosition: 'left',
  showButton: false,
  buttonText: '',
  buttonUrl: '',
  isActive: true,
};

export type HeroFieldSetter = <K extends keyof HeroFormState>(key: K, value: HeroFormState[K]) => void;

export function toHeroPayload(form: HeroFormState): HeroImagePayload {
  return {
    url: form.url.trim(),
    title: form.title.trim(),
    subtitle: form.subtitle,
    contentPosition: form.contentPosition,
    showButton: form.showButton,
    buttonText: form.buttonText,
    buttonUrl: form.buttonUrl,
    isActive: form.isActive,
  };
}

export function toHeroForm(record: HeroImageRecord): HeroFormState {
  return {
    url: record.url,
    title: record.title,
    subtitle: record.subtitle ?? '',
    contentPosition: record.contentPosition,
    showButton: record.showButton,
    buttonText: record.buttonText ?? '',
    buttonUrl: record.buttonUrl ?? '',
    isActive: record.isActive,
  };
}
