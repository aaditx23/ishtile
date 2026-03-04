import Link from 'next/link';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';

const NAV_ITEMS = [
  { href: '/profile',    label: 'Profile' },
  { href: '/orders',     label: 'My Orders' },
  { href: '/favourites', label: 'Favourites' },
] as const;

interface UserLayoutProps {
  children:   React.ReactNode;
  activeHref: string;
}

export default function UserLayout({ children, activeHref }: UserLayoutProps) {
  return (
    <ShopLayout>
      <div
        style={{
          maxWidth: '72rem',
          margin:   '0 auto',
          padding:  '2rem 1.25rem',
          display:  'grid',
          gridTemplateColumns: '14rem 1fr',
          gap:      '2rem',
          alignItems: 'start',
        }}
      >
        {/* Sidebar nav */}
        <nav
          style={{
            border:          '1px solid var(--border)',
            borderRadius:    '0.75rem',
            padding:         '0.5rem',
            backgroundColor: 'var(--surface)',
            display:         'flex',
            flexDirection:   'column',
            gap:             '0.25rem',
          }}
        >
          {NAV_ITEMS.map(({ href, label }) => {
            const isActive = activeHref === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display:         'block',
                  padding:         '0.625rem 0.875rem',
                  borderRadius:    '0.5rem',
                  fontSize:        '0.875rem',
                  fontWeight:      isActive ? 700 : 500,
                  textDecoration:  'none',
                  color:           isActive ? 'var(--on-primary)' : 'var(--on-surface)',
                  backgroundColor: isActive ? 'var(--brand-dark)' : 'transparent',
                  transition:      'background-color 0.15s',
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Page content */}
        <main>{children}</main>
      </div>
    </ShopLayout>
  );
}
