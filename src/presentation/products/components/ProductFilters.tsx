'use client';

import { useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiSearch, FiX } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Category } from '@/domain/category/category.entity';
import type { Brand } from '@/domain/brand/brand.entity';

interface ProductFiltersProps {
  categories: Category[];
  brands: Brand[];
}

const SECTION_LABEL: React.CSSProperties = {
  fontSize:      '0.62rem',
  fontWeight:    800,
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  color:         'var(--on-surface-muted)',
  marginBottom:  '0.7rem',
  display:       'block',
};

const PANEL: React.CSSProperties = {
  border: '1px solid var(--border)',
  backgroundColor: 'var(--surface)',
  padding: '0.9rem',
};

function FilterRow({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.45rem 0.55rem',
        height: 'auto',
        fontSize: '0.78rem',
        fontWeight: active ? 700 : 500,
        color: active ? 'var(--on-surface)' : 'var(--on-surface-muted)',
        backgroundColor: active ? 'var(--surface-variant)' : 'transparent',
        justifyContent: 'flex-start',
        width: '100%',
      }}
    >
      {label}
    </Button>
  );
}

export default function ProductFilters({ categories, brands }: ProductFiltersProps) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const searchRef    = useRef<HTMLInputElement>(null);

  const active = {
    search:     searchParams.get('search')     ?? '',
    category:   searchParams.get('category')   ?? '',
    sub:        searchParams.get('sub')        ?? '',
    brand:      searchParams.get('brand')      ?? '',
    featured:   searchParams.get('featured')   === '1',
    trending:   searchParams.get('trending')   === '1',
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

  const chips: Array<{ key: string; label: string; clear: () => void }> = [];
  if (active.search) chips.push({ key: 'search', label: `Search: ${active.search}`, clear: () => push({ search: '' }) });
  if (active.category) chips.push({ key: 'category', label: `Category: ${selectedCategory?.name ?? active.category}`, clear: () => push({ category: '', sub: '' }) });
  if (active.sub) {
    const selectedSub = subcategories.find((sc) => sc.slug === active.sub);
    chips.push({ key: 'sub', label: `Subcategory: ${selectedSub?.name ?? active.sub}`, clear: () => push({ sub: '' }) });
  }
  if (active.brand) {
    const selectedBrand = brands.find((b) => b.slug === active.brand);
    chips.push({ key: 'brand', label: `Brand: ${selectedBrand?.name ?? active.brand}`, clear: () => push({ brand: '' }) });
  }
  if (active.featured) chips.push({ key: 'featured', label: 'Featured', clear: () => push({ featured: '' }) });
  if (active.trending) chips.push({ key: 'trending', label: 'Trending', clear: () => push({ trending: '' }) });
  if (!active.activeOnly) chips.push({ key: 'activeOnly', label: 'Including inactive', clear: () => push({ activeOnly: '' }) });

  return (
    <aside
      style={{
        width:          '260px',
        flexShrink:     0,
        display:        'flex',
        flexDirection:  'column',
        gap:            '0.9rem',
        paddingTop:     '0.25rem',
        position:       'sticky',
        top:            '88px',
      }}
    >
      {/* ── Active chips ───────────────────────────────────────────── */}
      {chips.length > 0 && (
        <section style={PANEL}>
          <span style={SECTION_LABEL}>Active Filters</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {chips.map((chip) => (
              <button
                key={chip.key}
                onClick={chip.clear}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.28rem 0.5rem',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface-variant)',
                  color: 'var(--on-surface)',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                aria-label={`Remove ${chip.label} filter`}
              >
                <span>{chip.label}</span>
                <FiX size={11} />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Search ────────────────────────────────────────────────────── */}
      <section style={PANEL}>
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
                backgroundColor: 'var(--product-bg)',
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
            style={{ height: '36px', width: 'auto', padding: '0 0.65rem', backgroundColor: 'var(--primary)', color: 'var(--on-primary)' }}
            aria-label="Search"
          >
            <FiSearch size={13} />
          </Button>
        </div>
      </section>

      {/* ── Category ──────────────────────────────────────────────────── */}
      <section style={PANEL}>
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
        <section style={PANEL}>
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
      <section style={PANEL}>
        <span style={SECTION_LABEL}>Brand</span>
        <FilterRow active={!active.brand} label="All Brands" onClick={() => push({ brand: '' })} />
        {brands.map((brand) => (
          <FilterRow
            key={brand.id}
            active={active.brand === brand.slug}
            label={brand.name}
            onClick={() => push({ brand: brand.slug })}
          />
        ))}
      </section>

      {/* ── Toggles ────────────────────────────────────────────────────── */}
      <section style={{ ...PANEL, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
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
            checked={active.trending}
            onChange={(e) => push({ trending: e.target.checked ? '1' : '' })}
            style={{ accentColor: 'var(--brand-gold)', width: '14px', height: '14px' }}
          />
          Trending only
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
      {(active.search || active.category || active.brand || active.featured || active.trending || !active.activeOnly) && (
        <Button
          variant="outline"
          onClick={() => router.push('/products')}
          style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            color: 'var(--on-surface)',
            borderColor: 'var(--border)',
            justifyContent: 'center',
            letterSpacing: '0.06em',
          }}
        >
          Clear All Filters
        </Button>
      )}
    </aside>
  );
}
