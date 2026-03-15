import { convex } from './convexClient';
import { asId } from './convexHelpers';
import { api } from '../../../convex/_generated/api';
import type { Lookbook } from '@/domain/lookbook/lookbook.entity';
import type { ListLookbooksParams, LookbookRepository } from '@/domain/lookbook/lookbook.repository';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLookbook(row: any): Lookbook {
  return {
    id: asId(row._id ?? row.id),
    title: row.title,
    slug: row.slug,
    body: row.body ?? row.excerpt ?? null,
    coverImageUrl: row.coverImageUrl,
    imageUrls: row.imageUrls ?? [],
    displayOrder: row.displayOrder ?? 0,
    isActive: row.isActive,
  };
}

export class LookbookConvexRepository implements LookbookRepository {
  async list(params?: ListLookbooksParams): Promise<Lookbook[]> {
    const rows = await convex.query((api as any).lookbooks.queries.listLookbooks, {
      activeOnly: params?.activeOnly ?? true,
      limit: params?.limit ?? 3,
    });
    return (rows ?? []).map(mapLookbook);
  }

  async getBySlug(slug: string): Promise<Lookbook | null> {
    const row = await convex.query((api as any).lookbooks.queries.getLookbookBySlug, { slug });
    return row ? mapLookbook(row) : null;
  }
}
