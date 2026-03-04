'use client';

import { useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FiSearch, FiX } from 'react-icons/fi';
import type { Category } from '@/domain/category/category.entity';

interface ProductFiltersProps {
  categories: Category[];
}

/**
 * Horizontal filter bar — updates URL search params on change.
 * The server re-fetches products whenever the URL changes.
 */
export default function ProductFilters({ categories }: ProductFiltersProps) {
  const router      = useRouter();
  const searchParams = useSearchParams();

  const current = {
    category: searchParams.get('category') ?? '',
    search:   searchParams.get('search')   ?? '',
    page:     searchParams.get('page')     ?? '1',
  };

  const push = useCallback(
    (updates: Partial<typeof current>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries({ ...current, ...updates }).forEach(([k, v]) => {
        if (v && v !== '1') params.set(k, v);
        else params.delete(k);
      });
      // Reset to page 1 on any filter change
      if (updates.category !== undefined || updates.search !== undefined) {
        params.delete('page');
      }
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams, current],
  );

  return (
    <div style={{ padding: '1.5rem 3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '400px' }}>
        <FiSearch
          size={16}
          style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-muted)', pointerEvents: 'none' }}
        />
        <Input
          placeholder="Search products…"
          defaultValue={current.search}
          style={{ paddingLeft: '2.25rem', paddingRight: current.search ? '2.25rem' : undefined }}
          onChange={(e) => {
            // Debounce via a lightweight approach — push on blur or Enter
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') push({ search: (e.target as HTMLInputElement).value });
          }}
          onBlur={(e) => push({ search: e.target.value })}
        />
        {current.search && (
          <button
            onClick={() => push({ search: '' })}
            style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
            aria-label="Clear search"
          >
            <FiX size={16} />
          </button>
        )}
      </div>

      {/* Category pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        <Button
          variant={!current.category ? 'default' : 'outline'}
          style={{ borderRadius: '9999px', padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
          onClick={() => push({ category: '' })}
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={current.category === cat.slug ? 'default' : 'outline'}
            style={{ borderRadius: '9999px', padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
            onClick={() => push({ category: cat.slug })}
          >
            {cat.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
