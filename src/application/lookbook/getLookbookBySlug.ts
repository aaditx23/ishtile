import { lookbookRepository } from '@/lib/di';
import type { Lookbook } from '@/domain/lookbook/lookbook.entity';

export async function getLookbookBySlug(slug: string): Promise<Lookbook | null> {
  return lookbookRepository.getBySlug(slug);
}
