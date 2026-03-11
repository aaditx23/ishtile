import { BrandConvexRepository } from '@/infrastructure/convex/brandConvex.repository';
import type { Brand } from '@/domain/brand/brand.entity';
import type { ListBrandsParams } from '@/domain/brand/brand.repository';

const brandRepository = new BrandConvexRepository();

export async function getBrands(params?: ListBrandsParams): Promise<Brand[]> {
  return await brandRepository.list(params);
}
