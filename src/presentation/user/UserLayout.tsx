import Link from 'next/link';
import ShopLayout from '@/presentation/shared/layouts/ShopLayout';

interface UserLayoutProps {
  children:   React.ReactNode;
  activeHref: string;
}

export default function UserLayout({ children, activeHref }: UserLayoutProps) {
  return (
    <ShopLayout>
      <div
        style={{
          maxWidth: '56rem',
          margin:   '0 auto',
          padding:  '2rem 1.25rem',
        }}
      >
        {/* Page content */}
        <main>{children}</main>
      </div>
    </ShopLayout>
  );
}
