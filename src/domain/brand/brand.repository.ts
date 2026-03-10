import type { Brand } from './brand.entity';

export interface ListBrandsParams {
  activeOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CreateBrandPayload {
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export type UpdateBrandPayload = Partial<CreateBrandPayload>;

export interface BrandRepository {
  list(params?: ListBrandsParams): Promise<Brand[]>;
  getById(id: number): Promise<Brand | null>;
  getBySlug(slug: string): Promise<Brand | null>;
}

export interface AdminBrandRepository {
  uploadImage(file: File): Promise<string>;
  create(payload: CreateBrandPayload): Promise<Brand>;
  update(id: number, payload: UpdateBrandPayload): Promise<Brand>;
  delete(id: number): Promise<void>;
}
