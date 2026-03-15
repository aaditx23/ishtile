'use client';

import type { Category } from '@/domain/category/category.entity';
import ExploreBlock from './ExploreBlock';

interface CategoryExploreBlockProps {
  categories: Category[];
}

export default function CategoryExploreBlock({ categories }: CategoryExploreBlockProps) {
  return (
    <ExploreBlock
      title="Explore by Category"
      items={categories}
      queryKey="category"
      sectionPadding="1.25rem 0 0"
      showShopAll
    />
  );
}
