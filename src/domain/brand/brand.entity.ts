export interface Brand {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
}
