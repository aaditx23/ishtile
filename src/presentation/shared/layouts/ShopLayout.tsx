import AnnouncementBar from '@/presentation/home/components/AnnouncementBar';
import SiteHeader from '@/presentation/home/components/SiteHeader';
import SiteFooter from '@/presentation/home/components/SiteFooter';

interface ShopLayoutProps {
  children: React.ReactNode;
  /** Content to render in the announcement bar slot. Omit to hide it. */
  announcement?: string;
}

/**
 * ShopLayout wraps every public-facing page with SiteHeader + SiteFooter.
 * Pages simply render their own content as children.
 */
export default function ShopLayout({ children, announcement }: ShopLayoutProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AnnouncementBar text={announcement} />
      <SiteHeader />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
