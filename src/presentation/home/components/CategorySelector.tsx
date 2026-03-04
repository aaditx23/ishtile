'use client';

import Image from 'next/image';

// ── Types ─────────────────────────────────────────────────────────────────────

export type CategoryFilterValue = 'all' | number;

export interface CategorySelectorItem {
  value: CategoryFilterValue;
  label: string;
  image?: string;
  /** Background colour. Accepts any CSS color or var(). */
  bg?: string;
}

interface CategoryCardProps extends CategorySelectorItem {
  selected: boolean;
  onClick: () => void;
}

interface CategorySelectorProps {
  categories: CategorySelectorItem[];
  selected: CategoryFilterValue;
  onSelect: (value: CategoryFilterValue) => void;
}

// ── Category Card ─────────────────────────────────────────────────────────────

function CategoryCard({ label, image, bg = 'var(--surface-variant)', selected, onClick }: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        position:        'relative',
        overflow:        'hidden',
        cursor:          'pointer',
        flexShrink:      0,
        width:           '220px',
        minWidth:        '150px',
        aspectRatio:     '3/4',
        backgroundColor: bg,
        outline:         selected ? '2px solid var(--brand-gold)' : '2px solid transparent',
        borderRadius:    '0.75rem',
      }}
      className="transition-all duration-200 hover:brightness-105 hover:scale-[1.01]"
      aria-pressed={selected}
      aria-label={`Filter by ${label}`}
    >
      {image && (
        <Image
          src={image}
          alt={label}
          fill
          style={{ objectFit: 'contain', objectPosition: 'center' }}
          sizes="(max-width: 768px) 150px, 20vw"
        />
      )}

      <div
        style={{
          position: 'absolute',
          inset:    0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 40%)',
        }}
      />

      <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <span style={{ color: 'white', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '1.125rem', lineHeight: 1 }}>
          {label}
        </span>
        {selected && (
          <span style={{ display: 'block', height: '2px', width: '1.5rem', backgroundColor: 'var(--brand-gold)' }} />
        )}
      </div>
    </button>
  );
}

// ── Selector ──────────────────────────────────────────────────────────────────

export default function CategorySelector({ categories, selected, onSelect }: CategorySelectorProps) {
  return (
    <div style={{ overflowX: 'auto', padding: '2rem 3rem' }}>
      <div style={{ display: 'flex', gap: '1rem', width: 'max-content' }}>
        {categories.map((cat) => (
          <CategoryCard
            key={String(cat.value)}
            {...cat}
            selected={cat.value === selected}
            onClick={() => onSelect(cat.value)}
          />
        ))}
      </div>
    </div>
  );
}
