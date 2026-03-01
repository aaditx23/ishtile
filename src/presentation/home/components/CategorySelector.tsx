'use client';

import Image from 'next/image';

export type Category = 'All' | 'Men' | 'Women' | 'Unisex';

interface CategoryCardProps {
  label: Category;
  image?: string;
  bg: string;
  selected: boolean;
  onClick: () => void;
}

interface CategorySelectorProps {
  selected: Category;
  onSelect: (cat: Category) => void;
}

const categories: { label: Category; image?: string; bg: string }[] = [
  { label: 'All',    image: '/images/categories/all.png',    bg: '#1C1A19' },
  { label: 'Men',    image: '/images/categories/men.png',    bg: '#B8D4E8' },
  { label: 'Women',  image: '/images/categories/women.png',  bg: '#F2D0D8' },
  { label: 'Unisex', image: '/images/categories/unisex.png', bg: '#D6CEBC' },
];

function CategoryCard({ label, image, bg, selected, onClick }: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        flexShrink: 0,
        width: '240px',
        minWidth: '160px',
        aspectRatio: '3/4',
        backgroundColor: bg,
        outline: selected ? '2px solid #A58C69' : '2px solid transparent',
        borderRadius: '0.75rem',
      }}
      className="transition-all duration-200 hover:brightness-105 hover:scale-[1.01]"
      aria-pressed={selected}
      aria-label={`Filter by ${label}`}
    >
      {/* Image — contained so full figure is visible */}
      {image && (
        <Image
          src={image}
          alt={label}
          fill
          style={{ objectFit: 'contain', objectPosition: 'center' }}
          sizes="(max-width: 768px) 160px, 25vw"
        />
      )}

      {/* Subtle bottom gradient for label legibility */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 40%)',
        }}
      />

      {/* Label */}
      <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <span style={{ color: 'white', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '1.125rem', lineHeight: 1 }}>
          {label}
        </span>
        {selected && (
          <span style={{ display: 'block', height: '2px', width: '1.5rem', backgroundColor: '#A58C69' }} />
        )}
      </div>
    </button>
  );
}

export default function CategorySelector({ selected, onSelect }: CategorySelectorProps) {
  return (
    <div className="px-6 md:px-12" style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
      <h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.25rem', color: '#1C1A19' }}>Categories</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
        {categories.map((cat) => (
          <CategoryCard
            key={cat.label}
            label={cat.label}
            image={cat.image}
            bg={cat.bg}
            selected={selected === cat.label}
            onClick={() => onSelect(cat.label)}
          />
        ))}
      </div>
    </div>
  );
}
