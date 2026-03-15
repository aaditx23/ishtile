import type { Lookbook } from './lookbook.entity';

export interface ListLookbooksParams {
  activeOnly?: boolean;
  limit?: number;
}

export interface LookbookRepository {
  list(params?: ListLookbooksParams): Promise<Lookbook[]>;
  getBySlug(slug: string): Promise<Lookbook | null>;
}
