import Link from 'next/link';
import Image from 'next/image';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import { getLookbooks } from '@/application/lookbook/getLookbooks';

export default async function LookbookPage() {
  let lookbooks = [];
  try {
    lookbooks = await getLookbooks({ activeOnly: true, limit: 100 });
  } catch {
    lookbooks = [];
  }

  return (
    <ShopLayout>
      <div style={{ maxWidth: '90rem', margin: '0 auto', padding: '1.25rem 1rem 2rem' }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
          Lookbook
        </h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
          {lookbooks.map((item) => (
            <article key={item.id} style={{ border: '1px solid var(--brand-dark)', backgroundColor: 'var(--surface)', overflow: 'hidden' }}>
              <Link href={`/lookbook/${item.slug}`}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3', borderBottom: '1px solid var(--brand-dark)', background: 'var(--surface-muted)' }}>
                  <Image src={item.coverImageUrl} alt={item.title} fill style={{ objectFit: 'cover' }} sizes="(max-width: 1024px) 100vw, 33vw" />
                </div>
              </Link>
              <div style={{ padding: '0.9rem 0.95rem 1rem' }}>
                <h2 style={{ fontSize: '0.88rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.title}</h2>
                <p style={{ marginTop: '0.45rem', fontSize: '0.8rem', lineHeight: 1.45, color: 'var(--on-surface-muted)' }}>
                  {(() => {
                    const text = (item.body ?? '').trim();
                    if (text.length <= 160) return text;
                    return `${text.slice(0, 160).trim()}...`;
                  })()}
                </p>
                <Link href={`/lookbook/${item.slug}`} style={{ marginTop: '0.75rem', display: 'inline-block', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', textDecoration: 'underline', textUnderlineOffset: '4px' }}>
                  Read More
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </ShopLayout>
  );
}
