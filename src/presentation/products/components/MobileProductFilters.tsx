'use client';

import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiSearch, FiX, FiSliders } from 'react-icons/fi';
import type { Category } from '@/domain/category/category.entity';
import type { Brand } from '@/domain/brand/brand.entity';

interface MobileProductFiltersProps {
  categories: Category[];
  brands: Brand[];
  total?:     number;
}

export default function MobileProductFilters({ categories, brands, total }: MobileProductFiltersProps) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const searchRef    = useRef<HTMLInputElement>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const active = {
    search:     searchParams.get('search')     ?? '',
    category:   searchParams.get('category')   ?? '',
    sub:        searchParams.get('sub')        ?? '',
    brand:      searchParams.get('brand')      ?? '',
    featured:   searchParams.get('featured')   === '1',
    trending:   searchParams.get('trending')   === '1',
    activeOnly: searchParams.get('activeOnly') !== '0',
  };

  const push = (updates: Partial<Record<string, string>>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('page');
    const next  = { ...Object.fromEntries(params.entries()), ...updates };
    const clean = new URLSearchParams();
    for (const [k, v] of Object.entries(next)) {
      if (k === 'activeOnly' && v !== '0') continue;
      if (v) clean.set(k, v);
    }
    router.push(`/products?${clean.toString()}`);
  };

  const selectedCategory = categories.find((c) => c.slug === active.category);
  const subcategories    = selectedCategory?.subcategories ?? [];

  // count active extra filters (brand / featured / activeOnly-off / category)
  const extraCount =
    (active.brand ? 1 : 0) +
    (active.featured ? 1 : 0) +
    (active.trending ? 1 : 0) +
    (!active.activeOnly ? 1 : 0) +
    (active.category ? 1 : 0);

  const hasAny = active.search || active.category || active.brand || active.featured || active.trending || !active.activeOnly;

  const chips: Array<{ key: string; label: string; clear: () => void }> = [];
  if (active.search) chips.push({ key: 'search', label: active.search, clear: () => push({ search: '' }) });
  if (active.category) {
    const selectedCategoryName = categories.find((c) => c.slug === active.category)?.name ?? active.category;
    chips.push({ key: 'category', label: selectedCategoryName, clear: () => push({ category: '', sub: '' }) });
  }
  if (active.brand) {
    const selectedBrandName = brands.find((b) => b.slug === active.brand)?.name ?? active.brand;
    chips.push({ key: 'brand', label: selectedBrandName, clear: () => push({ brand: '' }) });
  }
  if (active.featured) chips.push({ key: 'featured', label: 'Featured', clear: () => push({ featured: '' }) });
  if (active.trending) chips.push({ key: 'trending', label: 'Trending', clear: () => push({ trending: '' }) });
  if (!active.activeOnly) chips.push({ key: 'activeOnly', label: 'Including inactive', clear: () => push({ activeOnly: '' }) });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem 1rem 0' }}>

      {/* ── Title row ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Products
        </h1>
      </div>

      {/* ── Search row ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <div style={{ position: 'absolute', left: '0.65rem', top: '0', bottom: '0', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            <FiSearch size={14} style={{ color: 'var(--on-surface-muted)' }} />
          </div>
          <input
            ref={searchRef}
            key={active.search}
            defaultValue={active.search}
            placeholder="Search products…"
            onKeyDown={(e) => {
              if (e.key === 'Enter') push({ search: (e.target as HTMLInputElement).value });
            }}
            style={{
              width:           '100%',
              padding:         '0.5rem 2rem 0.5rem 2.1rem',
              border:          '1px solid var(--border)',
              fontSize:        '0.825rem',
              backgroundColor: 'var(--surface)',
              color:           'inherit',
              outline:         'none',
            }}
          />
          {active.search && (
            <button
              onClick={() => push({ search: '' })}
              style={{ position: 'absolute', right: '0.4rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-muted)', padding: 0 }}
            >
              <FiX size={13} />
            </button>
          )}
        </div>
        <button
          onClick={() => push({ search: searchRef.current?.value ?? '' })}
          style={{ padding: '0.5rem 0.65rem', border: '1px solid var(--border)', background: 'var(--primary)', color: 'var(--on-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}
          aria-label="Search"
        >
          <FiSearch size={14} />
        </button>

        {/* Filters toggle */}
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          style={{
            display:         'flex',
            alignItems:      'center',
            gap:             '0.35rem',
            padding:         '0.5rem 0.75rem',
            border:          `1px solid ${filtersOpen || extraCount > 0 ? 'var(--brand-gold)' : 'var(--border)'}`,
            background:      filtersOpen ? 'var(--surface-variant)' : 'var(--surface)',
            fontSize:        '0.8rem',
            fontWeight:      600,
            color:           filtersOpen || extraCount > 0 ? 'var(--brand-gold)' : 'var(--on-surface)',
            cursor:          'pointer',
            flexShrink:      0,
            whiteSpace:      'nowrap',
          }}
        >
          <FiSliders size={14} />
          Filters
          {extraCount > 0 && (
            <span
              style={{
                display:         'inline-flex',
                alignItems:      'center',
                justifyContent:  'center',
                width:           '1.1rem',
                height:          '1.1rem',
                backgroundColor: 'var(--brand-gold)',
                color:           'var(--on-primary)',
                fontSize:        '0.65rem',
                fontWeight:      700,
              }}
            >
              {extraCount}
            </span>
          )}
        </button>
      </div>

      {chips.length > 0 && (
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '-0.1rem' }}>
          {chips.map((chip) => (
            <button
              key={chip.key}
              onClick={chip.clear}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.28rem 0.5rem',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--surface-variant)',
                color: 'var(--on-surface)',
                fontSize: '0.68rem',
                fontWeight: 600,
              }}
              aria-label={`Remove ${chip.label} filter`}
            >
              <span>{chip.label}</span>
              <FiX size={11} />
            </button>
          ))}
        </div>
      )}

      {/* ── Extra filters (bottom sheet) ─────────────────────────── */}
      {filtersOpen && (
        <>
          <button
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.32)',
              border: 'none',
              zIndex: 60,
              cursor: 'pointer',
            }}
          />

          <div
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 61,
              maxHeight: '80vh',
              overflowY: 'auto',
              backgroundColor: 'var(--surface)',
              borderTop: '1px solid var(--border)',
              boxShadow: '0 -10px 24px rgba(0,0,0,0.14)',
              padding: '1rem 1rem 0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.1rem' }}>
              <h2 style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Filter Products</h2>
              <button
                onClick={() => setFiltersOpen(false)}
                style={{
                  border: '1px solid var(--border)',
                  background: 'var(--product-bg)',
                  width: '1.9rem',
                  height: '1.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
                aria-label="Close filters"
              >
                <FiX size={14} />
              </button>
            </div>

          {/* Category */}
          <div>
            <label style={SECTION_LABEL}>Category</label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <Pill label="All" active={!active.category} onClick={() => push({ category: '', sub: '' })} />
              {categories.map((cat) => (
                <Pill key={cat.id} label={cat.name} active={active.category === cat.slug} onClick={() => push({ category: cat.slug, sub: '' })} />
              ))}
            </div>
          </div>

          {/* Subcategory */}
          {subcategories.length > 0 && (
            <div>
              <label style={SECTION_LABEL}>{selectedCategory!.name}</label>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <Pill label={`All ${selectedCategory!.name}`} active={!active.sub} onClick={() => push({ sub: '' })} />
                {subcategories.map((sc) => (
                  <Pill key={sc.id} label={sc.name} active={active.sub === sc.slug} onClick={() => push({ sub: sc.slug })} />
                ))}
              </div>
            </div>
          )}
          {/* Brand */}
          <div>
            <label style={SECTION_LABEL}>Brand</label>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <Pill label="All Brands" active={!active.brand} onClick={() => push({ brand: '' })} />
              {brands.map((brand) => (
                <Pill
                  key={brand.id}
                  label={brand.name}
                  active={active.brand === brand.slug}
                  onClick={() => push({ brand: brand.slug })}
                />
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={SECTION_LABEL}>Options</label>
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
          </div>

          {/* Clear all */}
          {hasAny && (
            <button
              onClick={() => { router.push('/products'); setFiltersOpen(false); }}
              style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-gold)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
            >
              × Clear all filters
            </button>
          )}
            <div style={{ position: 'sticky', bottom: 0, background: 'var(--surface)', paddingTop: '0.4rem', marginTop: '0.1rem' }}>
              <button
                onClick={() => setFiltersOpen(false)}
                style={{
                  width: '100%',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--on-primary)',
                  padding: '0.7rem 0.8rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                }}
              >
                Show Results
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Pill ────────────────────────────────────────────────────────────────────

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink:      0,
        padding:         '0.3rem 0.75rem',
        border:          `1px solid ${active ? 'var(--brand-gold)' : 'var(--border)'}`,
        backgroundColor: active ? 'var(--brand-gold)' : 'var(--surface)',
        color:           active ? 'var(--on-primary)' : 'var(--on-surface)',
        fontSize:        '0.78rem',
        fontWeight:      active ? 700 : 500,
        cursor:          'pointer',
        whiteSpace:      'nowrap',
      }}
    >
      {label}
    </button>
  );
}

// ─── Shared ──────────────────────────────────────────────────────────────────

const SECTION_LABEL: React.CSSProperties = {
  display:       'block',
  fontSize:      '0.6rem',
  fontWeight:    800,
  textTransform: 'uppercase',
  letterSpacing: '0.18em',
  color:         'var(--on-surface-muted)',
  marginBottom:  '0.4rem',
};
