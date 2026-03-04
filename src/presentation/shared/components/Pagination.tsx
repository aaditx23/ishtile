'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import type { Pagination as PaginationMeta } from '@/shared/types/api.types';

interface PaginationProps {
  pagination: PaginationMeta;
  /** URL param key to use (default "page") */
  paramKey?: string;
}

/**
 * Self-contained pagination bar — reads and updates the URL search params.
 * Works in any server component tree; no callbacks needed from the parent.
 */
export default function Pagination({ pagination, paramKey = 'page' }: PaginationProps) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { page, totalPages, hasPrev, hasNext } = pagination;

  if (totalPages <= 1) return null;

  const goTo = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (p === 1) params.delete(paramKey);
    else params.set(paramKey, String(p));
    router.push(`?${params.toString()}`);
  };

  const buildPages = (): (number | '...')[] => {
    const pages: (number | '...')[] = [];
    const delta = 1;
    const range: number[] = [];
    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i);
    }
    pages.push(1);
    if (range[0] > 2) pages.push('...');
    pages.push(...range);
    if (range[range.length - 1] < totalPages - 1) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  return (
    <nav
      aria-label="Pagination"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '2rem 0' }}
    >
      <Button variant="outline" size="sm" disabled={!hasPrev} onClick={() => goTo(page - 1)} aria-label="Previous page">
        ← Prev
      </Button>

      {buildPages().map((p, i) =>
        p === '...' ? (
          <span key={`e-${i}`} style={{ padding: '0 0.25rem', color: 'var(--on-surface-muted)' }}>…</span>
        ) : (
          <Button
            key={p}
            variant={p === page ? 'default' : 'outline'}
            size="sm"
            onClick={() => goTo(p)}
            aria-current={p === page ? 'page' : undefined}
            style={{ minWidth: '2.25rem' }}
          >
            {p}
          </Button>
        )
      )}

      <Button variant="outline" size="sm" disabled={!hasNext} onClick={() => goTo(page + 1)} aria-label="Next page">
        Next →
      </Button>
    </nav>
  );
}
