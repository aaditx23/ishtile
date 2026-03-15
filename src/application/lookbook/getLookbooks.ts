import { lookbookRepository } from '@/lib/di';
import type { Lookbook } from '@/domain/lookbook/lookbook.entity';
import type { ListLookbooksParams } from '@/domain/lookbook/lookbook.repository';

export async function getLookbooks(params?: ListLookbooksParams): Promise<Lookbook[]> {
  return lookbookRepository.list(params);
}
