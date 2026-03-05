export interface CreateVariantInput {
  size: string;
  color?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  weightGrams?: number;
  isActive?: boolean;
}

export interface CreateVariantWithInventoryInput extends CreateVariantInput {
  quantity: number;
}

export interface CreateProductPayload {
  categoryId: number;
  subcategoryId?: number;
  name: string;
  slug: string;
  sku: string;
  description?: string;
  basePrice: number;
  compareAtPrice?: number;
  imageUrls?: string[];
  images?: File[];
  material?: string;
  careInstructions?: string;
  brand?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  variants?: CreateVariantWithInventoryInput[];
}

export type UpdateProductPayload = Partial<CreateProductPayload>;

export interface CreateVariantPayload {
  productId: number;
  size: string;
  color?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  weightGrams?: number;
  isActive?: boolean;
}

export type UpdateVariantPayload = Partial<Omit<CreateVariantPayload, 'productId'>>;

export interface UpdateInventoryPayload {
  quantity: number;
}
