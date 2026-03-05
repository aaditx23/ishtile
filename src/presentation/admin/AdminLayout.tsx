import Link from 'next/link';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';
import { FiGrid, FiShoppingBag, FiPackage, FiTag, FiBarChart2, FiFolder } from 'react-icons/fi';

export const ADMIN_NAV_ITEMS = [
  { href: '/admin',             label: 'Dashboard',  Icon: FiGrid },
  { href: '/admin/orders',      label: 'Orders',     Icon: FiShoppingBag },
  { href: '/admin/products',    label: 'Products',   Icon: FiPackage },
  { href: '/admin/categories',  label: 'Categories', Icon: FiFolder },
  { href: '/admin/promos',      label: 'Promos',     Icon: FiTag },
  { href: '/admin/analytics',   label: 'Analytics',  Icon: FiBarChart2 },
] as const;

interface AdminLayoutProps {
  children:   React.ReactNode;
  activeHref: string;
}

/** Sidebar nav only — no ShopLayout wrapper. Use inside your own ShopLayout. */
export function AdminSidebarNav({ activeHref }: { activeHref: string }) {
  return (
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
      <p
        style={{
          fontSize:      '0.65rem',
          fontWeight:    700,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color:         'var(--on-surface-muted)',
          padding:       '0.5rem 0.875rem 0.25rem',
        }}
      >
        Admin
      </p>
      {ADMIN_NAV_ITEMS.map(({ href, label, Icon }) => {
        const isActive = activeHref === href;
        return (
          <Link
            key={href}
            href={href}
            style={{
              display:         'flex',
              alignItems:      'center',
              gap:             '0.625rem',
              padding:         '0.6rem 0.875rem',
              borderRadius:    '0.5rem',
              fontSize:        '0.875rem',
              fontWeight:      isActive ? 700 : 500,
              textDecoration:  'none',
              color:           isActive ? 'var(--on-primary)' : 'var(--on-surface)',
              backgroundColor: isActive ? 'var(--primary)' : 'transparent',
            }}
          >
            <Icon size={15} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminLayout({ children, activeHref }: AdminLayoutProps) {
  return (
    <ShopLayout>
      <div
        style={{
          maxWidth:            '84rem',
          margin:              '0 auto',
          padding:             '2rem 1.25rem',
          display:             'grid',
          gridTemplateColumns: '13rem 1fr',
          gap:                 '2rem',
          alignItems:          'start',
        }}
      >
        <AdminSidebarNav activeHref={activeHref} />
        <main>{children}</main>
      </div>
    </ShopLayout>
  );
}
