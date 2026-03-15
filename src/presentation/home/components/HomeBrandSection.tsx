'use client';

import type { Brand } from '@/domain/brand/brand.entity';
import ExploreBlock from './ExploreBlock';

interface HomeBrandSectionProps {
  brands: Brand[];
}

export default function HomeBrandSection({ brands }: HomeBrandSectionProps) {
  return (
    <ExploreBlock
      title="Explore by Brand"
      items={brands}
      queryKey="brand"
      sectionPadding="1.25rem 0 2.25rem"
    />
  );
}
