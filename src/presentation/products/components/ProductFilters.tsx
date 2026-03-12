'use client';

import { useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiSearch, FiX, FiChevronRight } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Category } from '@/domain/category/category.entity';

interface ProductFiltersProps {
  categories: Category[];
}

const SECTION_LABEL: React.CSSProperties = {
  fontSize:      '0.6rem',
  fontWeight:    800,
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  color:         'var(--on-surface-muted)',
  marginBottom:  '0.625rem',
  display:       'block',
};

function FilterRow({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.35rem 0.5rem',
        height: 'auto',
        fontSize: '0.8rem',
        fontWeight: active ? 700 : 500,
        color: active ? 'var(--on-surface)' : 'var(--on-surface-muted)',
        backgroundColor: active ? 'var(--surface-variant)' : 'transparent',
        justifyContent: 'flex-start',
        width: '100%',
      }}
    >
      {active && <FiChevronRight size={12} style={{ color: 'var(--brand-gold)', flexShrink: 0 }} />}
      {label}
    </Button>
  );
}

export default function ProductFilters({ categories }: ProductFiltersProps) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const brandRef     = useRef<HTMLInputElement>(null);
  const searchRef    = useRef<HTMLInputElement>(null);

  const active = {
    search:     searchParams.get('search')     ?? '',
    category:   searchParams.get('category')   ?? '',
    sub:        searchParams.get('sub')        ?? '',
    brand:      searchParams.get('brand')      ?? '',
    featured:   searchParams.get('featured')   === '1',
    activeOnly: searchParams.get('activeOnly') !== '0', // default true
  };

  const push = useCallback(
    (updates: Partial<Record<string, string>>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page'); // reset pagination on any filter change

      const next = { ...Object.fromEntries(params.entries()), ...updates };
      const clean = new URLSearchParams();
      for (const [k, v] of Object.entries(next)) {
        // Keep activeOnly=0 explicitly; drop empty / default-true activeOnly
        if (k === 'activeOnly' && v !== '0') continue;
        if (v) clean.set(k, v);
      }
      router.push(`/products?${clean.toString()}`);
    },
    [router, searchParams],
  );

  const selectedCategory = categories.find((c) => c.slug === active.category);
  const subcategories    = selectedCategory?.subcategories ?? [];

  return (
    <aside
      style={{
        width:          '220px',
        flexShrink:     0,
        display:        'flex',
        flexDirection:  'column',
        gap:            '1.75rem',
        paddingTop:     '0.25rem',
      }}
    >
      {/* ── Search ────────────────────────────────────────────────────── */}
      <section>
        <span style={SECTION_LABEL}>Search</span>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <div style={{ position: 'absolute', left: '0.65rem', top: '0', bottom: '0', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
              <FiSearch size={14} style={{ color: 'var(--on-surface-muted)' }} />
            </div>
            <Input
              ref={searchRef}
              key={active.search}
              defaultValue={active.search}
              placeholder="Search…"
              onKeyDown={(e) => {
                if (e.key === 'Enter') push({ search: (e.target as HTMLInputElement).value });
              }}
              style={{
                paddingLeft: '2rem',
                paddingRight: '1.75rem',
                fontSize: '0.8rem',
              }}
            />
            {active.search && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => push({ search: '' })}
                style={{ position: 'absolute', right: '0.4rem', top: '50%', transform: 'translateY(-50%)', height: 'auto', width: 'auto', padding: 0 }}
                aria-label="Clear search"
              >
                <FiX size={13} />
              </Button>
            )}
          </div>
          <Button
            onClick={() => push({ search: searchRef.current?.value ?? '' })}
            style={{ height: '36px', width: 'auto', padding: '0 0.65rem' }}
            aria-label="Search"
          >
            <FiSearch size={13} />
          </Button>
        </div>
      </section>

      {/* ── Category ──────────────────────────────────────────────────── */}
      <section>
        <span style={SECTION_LABEL}>Category</span>
        <FilterRow active={!active.category} label="All Categories" onClick={() => push({ category: '', sub: '' })} />
        {categories.map((cat) => (
          <FilterRow
            key={cat.id}
            active={active.category === cat.slug}
            label={cat.name}
            onClick={() => push({ category: cat.slug, sub: '' })}
          />
        ))}
      </section>

      {/* ── Subcategory (conditional) ─────────────────────────────────── */}
      {subcategories.length > 0 && (
        <section>
          <span style={SECTION_LABEL}>Subcategory</span>
          <FilterRow active={!active.sub} label={`All ${selectedCategory!.name}`} onClick={() => push({ sub: '' })} />
          {subcategories.map((sc) => (
            <FilterRow
              key={sc.id}
              active={active.sub === sc.slug}
              label={sc.name}
              onClick={() => push({ sub: sc.slug })}
            />
          ))}
        </section>
      )}

      {/* ── Brand ─────────────────────────────────────────────────────── */}
      <section>
        <span style={SECTION_LABEL}>Brand</span>
        <div style={{ position: 'relative' }}>
          <Input
            ref={brandRef}
            key={active.brand}
            defaultValue={active.brand}
            placeholder="e.g. Levi's"
            onKeyDown={(e) => {
              if (e.key === 'Enter') push({ brand: (e.target as HTMLInputElement).value.trim() });
            }}
            style={{
              paddingRight: '1.75rem',
              fontSize: '0.8rem',
            }}
          />
          {active.brand && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => push({ brand: '' })}
              style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', height: 'auto', width: 'auto', padding: 0 }}
              aria-label="Clear brand"
            >
              <FiX size={13} />
            </Button>
          )}
        </div>
      </section>

      {/* ── Toggles ────────────────────────────────────────────────────── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span style={SECTION_LABEL}>Filter</span>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={active.featured}
            onChange={(e) => push({ featured: e.target.checked ? '1' : '' })}
            style={{ accentColor: 'var(--brand-gold)', width: '14px', height: '14px' }}
          />
          Featured only
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={active.activeOnly}
            onChange={(e) => push({ activeOnly: e.target.checked ? '' : '0' })}
            style={{ accentColor: 'var(--brand-gold)', width: '14px', height: '14px' }}
          />
          Active products only
        </label>
      </section>

      {/* ── Clear all ─────────────────────────────────────────────────── */}
      {(active.search || active.category || active.brand || active.featured || !active.activeOnly) && (
        <Button
          variant="ghost"
          onClick={() => router.push('/products')}
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--brand-gold)',
            padding: 0,
            height: 'auto',
            letterSpacing: '0.02em',
          }}
        >
          × Clear all filters
        </Button>
      )}
    </aside>
  );
}
