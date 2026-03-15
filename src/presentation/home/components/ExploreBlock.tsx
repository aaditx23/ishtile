'use client';

import Link from 'next/link';
import Image from 'next/image';

export interface ExploreBlockItem {
  id: string | number;
  name: string;
  slug: string;
  imageUrl?: string | null;
}

interface ExploreBlockProps {
  title: string;
  items: ExploreBlockItem[];
  queryKey: 'category' | 'brand';
  sectionPadding: string;
  showShopAll?: boolean;
}

export default function ExploreBlock({
  title,
  items,
  queryKey,
  sectionPadding,
  showShopAll = false,
}: ExploreBlockProps) {
  const visibleItems = items.slice(0, 6);

  if (visibleItems.length === 0) return null;

  return (
    <section style={{ padding: sectionPadding }}>
      <div
        style={{
          borderTop: '1px solid var(--brand-dark)',
          borderBottom: '1px solid var(--brand-dark)',
          backgroundColor: 'var(--surface)',
          padding: '1.15rem',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', textAlign: 'center' }}>{title}</h2>
          {showShopAll ? (
            <Link
              href="/products"
              style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'underline', textUnderlineOffset: '4px' }}
            >
              Shop All
            </Link>
          ) : null}
        </div>

        <div
          style={{
            marginTop: '1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, 500px)',
            justifyContent: 'center',
            justifyItems: 'center',
            gap: '0.75rem',
          }}
        >
          {visibleItems.map((item) => (
            <Link
              key={item.id}
              href={`/products?${queryKey}=${encodeURIComponent(item.slug)}`}
              style={{
                border: '1px solid var(--brand-dark)',
                backgroundColor: 'var(--surface)',
                overflow: 'hidden',
                width: '500px',
              }}
            >
              <div style={{ position: 'relative', width: '100%', height: '500px', borderBottom: '1px solid var(--brand-dark)', background: 'var(--surface-muted)' }}>
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="500px"
                  />
                ) : null}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  minHeight: '64px',
                  padding: '0.75rem 0.8rem',
                  backgroundColor: 'var(--surface)',
                }}
              >
                <p style={{ color: 'var(--on-surface)', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {item.name}
                </p>
                <span style={{ color: 'var(--on-surface)', fontSize: '1rem', fontWeight: 800, lineHeight: 1 }}>{'>'}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}