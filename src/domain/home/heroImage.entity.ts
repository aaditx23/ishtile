export interface HeroImage {
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
