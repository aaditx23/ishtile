import Image from 'next/image';
import Link from 'next/link';
import type { Lookbook } from '@/domain/lookbook/lookbook.entity';

interface LookbookSectionProps {
  lookbooks: Lookbook[];
}

export default function LookbookSection({ lookbooks }: LookbookSectionProps) {
  if (lookbooks.length === 0) return null;

  const toExcerpt = (body: string | null) => {
    const text = (body ?? '').trim();
    if (text.length <= 160) return text;
    return `${text.slice(0, 160).trim()}...`;
  };

  return (
    <section style={{ padding: '1.25rem 0 1.25rem' }}>
      <div
        style={{
          borderTop: '1px solid var(--brand-dark)',
          borderBottom: '1px solid var(--brand-dark)',
          backgroundColor: 'var(--surface)',
          padding: '1.15rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>View lookbooks</h3>
          <Link
            href="/lookbook"
            style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'underline', textUnderlineOffset: '4px' }}
          >
            View Lookbook
          </Link>
        </div>

        <div
          style={{
            marginTop: '1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '0.85rem',
          }}
        >
          {lookbooks.map((item) => (
            <article key={item.id} style={{ border: '1px solid var(--brand-dark)', backgroundColor: 'var(--surface)', overflow: 'hidden' }}>
              <Link href={`/lookbook/${item.slug}`}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', borderBottom: '1px solid var(--brand-dark)', background: 'var(--surface-muted)' }}>
                  <Image src={item.coverImageUrl} alt={item.title} fill style={{ objectFit: 'cover' }} sizes="(max-width: 1024px) 100vw, 33vw" />
                </div>
              </Link>

              <div style={{ padding: '0.9rem 0.95rem 1rem' }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.title}</h4>
                <p style={{ marginTop: '0.45rem', fontSize: '0.8rem', lineHeight: 1.45, color: 'var(--on-surface-muted)' }}>
                  {toExcerpt(item.body)}
                </p>
                <Link
                  href={`/lookbook/${item.slug}`}
                  style={{ marginTop: '0.75rem', display: 'inline-block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'underline', textUnderlineOffset: '4px' }}
                >
                  Read More
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
