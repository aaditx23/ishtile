import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  viewAllHref: string;
}

export default function SectionHeader({ title, viewAllHref }: SectionHeaderProps) {
  return (
    <div
      className="px-6 md:px-12"
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding:'1rem'}}
    >
      <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgb(163,163,163)' }}>
        {title}
      </span>
      <Link
        href={viewAllHref}
        style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#1C1A19', textUnderlineOffset: '4px' }}
        className="hover:underline"
      >
        View All →
      </Link>
    </div>
  );
}
