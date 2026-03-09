export interface ProductVariant {
  id: number;
  productId: number;
  size: string;
  color: string | null;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  quantity: number;
  isActive: boolean;
  stock?: number; // Available stock from inventory (populated when includeVariants)
}

export interface Product {
  id: number;
  slug: string;
  name: string;
  sku: string;
  description: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  imageUrls: string[];
  brand: string | null;
  material: string | null;
  careInstructions: string | null;
  categoryId: number;
  subcategoryId: number | null;
  isFeatured: boolean;
  isActive: boolean;
  variants?: ProductVariant[];
}
