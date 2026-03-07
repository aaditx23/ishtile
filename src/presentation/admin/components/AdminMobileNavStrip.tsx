import Link from 'next/link';
import { ADMIN_NAV_ITEMS } from '../AdminLayout';

interface AdminMobileNavStripProps {
  activeHref: string;
}

/**
 * Horizontally-scrolling pill nav used at the top of every mobile admin page.
 * Must be rendered inside a 'use client' tree (uses Link, no state itself).
 */
export default function AdminMobileNavStrip({ activeHref }: AdminMobileNavStripProps) {
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
      {ADMIN_NAV_ITEMS.map(({ href, label, Icon }) => {
        const active = href === activeHref;
        return (
          <Link
            key={href}
            href={href}
            style={{
              display:         'inline-flex',
              alignItems:      'center',
              gap:             '0.3rem',
              padding:         '0.4rem 0.75rem',
              border:          '1px solid var(--border)',
              borderRadius:    '0.5rem',
              fontSize:        '0.75rem',
              fontWeight:      active ? 700 : 500,
              textDecoration:  'none',
              whiteSpace:      'nowrap',
              color:           active ? 'var(--on-primary)' : 'var(--on-surface)',
              backgroundColor: active ? 'var(--primary)' : 'var(--surface)',
              flexShrink:      0,
            }}
          >
            <Icon size={12} />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
