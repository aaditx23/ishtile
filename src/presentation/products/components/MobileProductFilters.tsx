'use client';

import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiSearch, FiX, FiSliders } from 'react-icons/fi';
import type { Category } from '@/domain/category/category.entity';

interface MobileProductFiltersProps {
  categories: Category[];
  total?:     number;
}

export default function MobileProductFilters({ categories, total }: MobileProductFiltersProps) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const brandRef     = useRef<HTMLInputElement>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const active = {
    search:     searchParams.get('search')     ?? '',
    category:   searchParams.get('category')   ?? '',
    sub:        searchParams.get('sub')        ?? '',
    brand:      searchParams.get('brand')      ?? '',
    featured:   searchParams.get('featured')   === '1',
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

  // count active extra filters (brand / featured / activeOnly-off)
  const extraCount =
    (active.brand ? 1 : 0) +
    (active.featured ? 1 : 0) +
    (!active.activeOnly ? 1 : 0);

  const hasAny = active.search || active.category || active.brand || active.featured || !active.activeOnly;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem 1rem 0' }}>

      {/* ── Title row ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Products
        </h1>
        {total != null && (
          <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-muted)' }}>
            {total} {total === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>

      {/* ── Search row ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <FiSearch
            size={14}
            style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-muted)', pointerEvents: 'none' }}
          />
          <input
            defaultValue={active.search}
            placeholder="Search products…"
            onKeyDown={(e) => {
              if (e.key === 'Enter') push({ search: (e.target as HTMLInputElement).value });
            }}
            style={{
              width:           '100%',
              padding:         '0.5rem 2rem 0.5rem 2.1rem',
              borderRadius:    '0.5rem',
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
              style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-muted)', padding: 0 }}
            >
              <FiX size={13} />
            </button>
          )}
        </div>

        {/* Filters toggle */}
        <button
          onClick={() => setFiltersOpen((o) => !o)}
          style={{
            display:         'flex',
            alignItems:      'center',
            gap:             '0.35rem',
            padding:         '0.5rem 0.75rem',
            borderRadius:    '0.5rem',
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
                borderRadius:    '50%',
                backgroundColor: 'var(--brand-gold)',
                color:           '#fff',
                fontSize:        '0.65rem',
                fontWeight:      700,
              }}
            >
              {extraCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Category pills (horizontal scroll) ──────────────────── */}
      <div
        style={{
          display:         'flex',
          gap:             '0.4rem',
          overflowX:       'auto',
          scrollbarWidth:  'none',
          paddingBottom:   '2px',
        }}
      >
        {/* "All" pill */}
        <Pill
          label="All"
          active={!active.category}
          onClick={() => push({ category: '', sub: '' })}
        />
        {categories.map((cat) => (
          <Pill
            key={cat.id}
            label={cat.name}
            active={active.category === cat.slug}
            onClick={() => push({ category: cat.slug, sub: '' })}
          />
        ))}
      </div>

      {/* ── Subcategory pills (when category is selected) ───────── */}
      {subcategories.length > 0 && (
        <div
          style={{
            display:        'flex',
            gap:            '0.4rem',
            overflowX:      'auto',
            scrollbarWidth: 'none',
            paddingBottom:  '2px',
          }}
        >
          <Pill
            label={`All ${selectedCategory!.name}`}
            active={!active.sub}
            onClick={() => push({ sub: '' })}
          />
          {subcategories.map((sc) => (
            <Pill
              key={sc.id}
              label={sc.name}
              active={active.sub === sc.slug}
              onClick={() => push({ sub: sc.slug })}
            />
          ))}
        </div>
      )}

      {/* ── Extra filters (collapsible) ──────────────────────────── */}
      {filtersOpen && (
        <div
          style={{
            display:         'flex',
            flexDirection:   'column',
            gap:             '0.75rem',
            padding:         '0.875rem',
            borderRadius:    '0.625rem',
            border:          '1px solid var(--border)',
            backgroundColor: 'var(--surface)',
          }}
        >
          {/* Brand */}
          <div>
            <label style={SECTION_LABEL}>Brand</label>
            <div style={{ position: 'relative' }}>
              <input
                ref={brandRef}
                key={active.brand}
                defaultValue={active.brand}
                placeholder="e.g. Levi's"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') push({ brand: (e.target as HTMLInputElement).value.trim() });
                }}
                style={{
                  width:           '100%',
                  padding:         '0.45rem 1.75rem 0.45rem 0.65rem',
                  borderRadius:    '0.5rem',
                  border:          '1px solid var(--border)',
                  fontSize:        '0.8rem',
                  backgroundColor: 'var(--background)',
                  color:           'inherit',
                  outline:         'none',
                }}
              />
              {active.brand && (
                <button
                  onClick={() => push({ brand: '' })}
                  style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--on-surface-muted)', padding: 0 }}
                >
                  <FiX size={13} />
                </button>
              )}
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
        </div>
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
        borderRadius:    '999px',
        border:          `1px solid ${active ? 'var(--brand-gold)' : 'var(--border)'}`,
        backgroundColor: active ? 'var(--brand-gold)' : 'var(--surface)',
        color:           active ? '#fff' : 'var(--on-surface)',
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
