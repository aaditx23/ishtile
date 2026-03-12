import Link from 'next/link';

const USER_NAV_ITEMS = [
  { href: '/profile',    label: 'Profile' },
  { href: '/orders',     label: 'Orders' },
  { href: '/favourites', label: 'Favourites' },
];

interface UserMobileNavStripProps {
  activeHref: string;
}

export default function UserMobileNavStrip({ activeHref }: UserMobileNavStripProps) {
  return (
    <div
      style={{
        display:        'flex',
        gap:            '0.4rem',
        overflowX:      'auto',
        paddingBottom:  '0.25rem',
        marginBottom:   '1.25rem',
        scrollbarWidth: 'none',
      }}
    >
      {USER_NAV_ITEMS.map(({ href, label }) => {
        const active = href === activeHref;
        return (
          <Link
            key={href}
            href={href}
            style={{
              display:         'inline-flex',
              alignItems:      'center',
              padding:         '0.4rem 0.875rem',
              border:          '1px solid var(--border)',
              fontSize:        '0.78rem',
              fontWeight:      active ? 700 : 500,
              textDecoration:  'none',
              whiteSpace:      'nowrap',
              color:           active ? 'var(--on-primary)' : 'var(--on-surface)',
              backgroundColor: active ? 'var(--primary)' : 'var(--surface)',
              flexShrink:      0,
            }}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
