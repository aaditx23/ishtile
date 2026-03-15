export interface Lookbook {
  id: number;
  title: string;
  slug: string;
  body: string | null;
  coverImageUrl: string;
  imageUrls: string[];
  displayOrder: number;
  isActive: boolean;
}
