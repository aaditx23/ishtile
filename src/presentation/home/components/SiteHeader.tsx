  'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import { HamburgerIcon } from '@/components/icons';
import { useCurrentUser } from '@/presentation/shared/hooks/useCurrentUser';
import { tokenStore } from '@/infrastructure/auth/tokenStore';
import { getSiteBranding } from '@/application/customizations/heroCustomizations';
import { MobileNav } from './MobileNav';
import { SearchBar } from './SearchBar';
import { CartButton } from './CartButton';

/* ─── Link data ────────────────────────────────────────────────────────────── */

const SHOP_LINKS = [
  { label: 'Shop', href: '/products' },
  { label: 'Lookbook', href: '/lookbook' },
];

const USER_LINKS = [
  { label: 'Profile',    href: '/profile' },
  { label: 'My Orders',  href: '/orders' },
  { label: 'Favourites', href: '/favourites' },
];

const BRANDING_CACHE_KEY = 'ishtile.branding.v1';

function readCachedBranding(): { siteName: string; brandLogoUrl: string | null } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(BRANDING_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { siteName?: unknown; brandLogoUrl?: unknown };
    const siteName = typeof parsed.siteName === 'string' && parsed.siteName.trim()
      ? parsed.siteName.trim()
      : 'Ishtile';
    const brandLogoUrl = typeof parsed.brandLogoUrl === 'string' && parsed.brandLogoUrl.trim()
      ? parsed.brandLogoUrl
      : null;
    return { siteName, brandLogoUrl };
  } catch {
    return null;
  }
}

function writeCachedBranding(siteName: string, brandLogoUrl: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      BRANDING_CACHE_KEY,
      JSON.stringify({ siteName, brandLogoUrl }),
    );
  } catch {
    // Ignore storage failures (private mode/quota).
  }
}

function getProfileLabel(username?: string | null): string {
  const normalized = username?.trim();
  if (!normalized) return 'Profile';
  return `${normalized}'s profile`;
}

/* ─── SiteHeader ───────────────────────────────────────────────────────────── */

interface SiteHeaderProps {
  initialSiteName?: string;
  initialBrandLogoUrl?: string | null;
}

export default function SiteHeader({
  initialSiteName = 'Ishtile',
  initialBrandLogoUrl = null,
}: SiteHeaderProps) {
  const auth         = useCurrentUser();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [siteName, setSiteName]       = useState(initialSiteName);
  const [brandLogoUrl, setBrandLogoUrl] = useState<string | null>(initialBrandLogoUrl);

  const isAuth  = auth.status === 'authenticated';
  const isAdmin = isAuth && auth.user.role === 'admin';

  // Helper to check if a link is active
  const isLinkActive = (href: string) => {
    const currentUrl = pathname + (searchParams.toString() ? '?' + searchParams.toString() : '');

    // Exact match for query-param links (e.g. New In, Sale)
    if (href.includes('?')) {
      return currentUrl === href;
    }

    // For plain path links: yield to any sibling query-param link that claims this URL
    const siblingClaims = SHOP_LINKS.some((l) => l.href.includes('?') && currentUrl === l.href);
    if (siblingClaims) return false;

    const linkBase = href.split('?')[0];
    return pathname === linkBase || pathname.startsWith(linkBase + '/');
  };

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    let mounted = true;
    const cachedBranding = readCachedBranding();

    if (cachedBranding) {
      setSiteName(cachedBranding.siteName);
      setBrandLogoUrl(cachedBranding.brandLogoUrl);
    }

    getSiteBranding()
      .then((branding) => {
        if (!mounted) return;
        const nextSiteName = branding.siteName?.trim() || 'Ishtile';
        const nextBrandLogoUrl = branding.brandLogoUrl ?? null;
        setSiteName(nextSiteName);
        setBrandLogoUrl(nextBrandLogoUrl);
        writeCachedBranding(nextSiteName, nextBrandLogoUrl);
      })
      .catch(() => {
        if (!mounted) return;
        if (!cachedBranding) {
          setSiteName('Ishtile');
          setBrandLogoUrl(null);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const closeMobile = () => setMobileOpen(false);
  
  const handleLogout = () => {
    tokenStore.clearAll();
    window.location.href = '/';
  };

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: '4rem',
        transition: 'background 300ms, box-shadow 300ms',
        background: scrolled ? 'color-mix(in srgb, var(--brand-dark) 80%, transparent)' : 'color-mix(in srgb, var(--brand-dark) 100%, transparent)',
        backdropFilter: 'blur(12px)',
        boxShadow: scrolled ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      <div
        style={{
          maxWidth: '80rem',
          margin: '0 auto',
          height: '100%',
          padding: '2rem',
          
        }}
      >
        {/* ── ROW 1: LEFT (Start alignment) ────────────────────────────── */}
        <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', pointerEvents: 'none', paddingLeft: '1rem', maxWidth: '42%', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', pointerEvents: 'auto' }}>
            {/* Mobile hamburger — hidden on ≥1024px */}
            <div className="flex items-center lg:!hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open menu" className="text-white hover:bg-white/10">
                    <HamburgerIcon />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-[var(--brand-dark)] text-white border-r border-white/10 w-72 overflow-y-auto">
                  <SheetTitle className="text-white tracking-widest text-sm uppercase font-black mb-6 text-center pt-4">
                    {siteName}
                  </SheetTitle>
                  
                  <MobileNav
                    isAuth={isAuth}
                    isAdmin={isAdmin}
                    username={isAuth ? auth.user.username : null}
                    pathname={pathname}
                    isLinkActive={isLinkActive}
                    onClose={closeMobile}
                  />
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop nav (hidden below lg) */}
            <NavigationMenu className="hidden lg:flex" viewport={false}>
              <NavigationMenuList className="gap-2">
                {SHOP_LINKS.map((link) => (
                  <NavigationMenuItem key={link.href}>
                    <NavigationMenuLink asChild active={isLinkActive(link.href)}>
                      <Link
                        href={link.href}
                        className="h-auto px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.1em] hover:bg-transparent data-[active]:bg-transparent data-[active]:border-b data-[active]:border-[var(--brand-gold)] data-[active]:rounded-none data-[active]:text-[var(--brand-gold)] !text-white visited:!text-white hover:!text-[var(--brand-gold)] focus-visible:!text-[var(--brand-gold)]"
                        style={{paddingLeft:'0.5rem', paddingRight:'0.5rem' }}
                      >
                        {link.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
                
                {isAuth && (
                  <>
                    <div className="w-px h-4 bg-white/20 mx-3" />
                    {USER_LINKS.map((link) => (
                      <NavigationMenuItem key={link.href}>
                        <NavigationMenuLink asChild active={isLinkActive(link.href)}>
                          <Link
                            href={link.href}
                            className="h-auto px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.1em] hover:bg-transparent data-[active]:bg-transparent data-[active]:border-b data-[active]:border-[var(--brand-gold)] data-[active]:rounded-none data-[active]:text-[var(--brand-gold)] !text-white visited:!text-white hover:!text-[var(--brand-gold)] focus-visible:!text-[var(--brand-gold)]"
                            style={{paddingLeft:'0.5rem', paddingRight:'0.5rem' }}
                          >
                            {link.href === '/profile' ? getProfileLabel(auth.user.username) : link.label}
                          </Link>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    ))}
                  </>
                )}
                
                {isAdmin && (
                  <>
                    <div className="w-px h-4 bg-white/20 mx-3" />
                    <NavigationMenuItem>
                      <NavigationMenuLink asChild active={pathname === '/admin' || pathname.startsWith('/admin/')}>
                        <Link
                          href="/admin"
                          style={{paddingLeft:'0.5rem', paddingRight:'0.5rem' }}
                          className="h-auto px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.1em] hover:bg-transparent data-[active]:bg-transparent data-[active]:border-b data-[active]:border-[var(--brand-gold)] data-[active]:rounded-none data-[active]:text-[var(--brand-gold)] !text-white visited:!text-white hover:!text-[var(--brand-gold)] focus-visible:!text-[var(--brand-gold)]"
                        >
                          Dashboard
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  </>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        {/* ── ROW 2: CENTER (Center alignment) ────────────────────────────── */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto' }}>
            <Link href="/" aria-label={`${siteName} Home`} style={{ textDecoration: 'none' }}>
              {brandLogoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={brandLogoUrl}
                  alt={siteName}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  style={{ height: '2rem', width: 'auto', maxWidth: '10rem', objectFit: 'contain', userSelect: 'none' }}
                />
              ) : (
                <span style={{ fontSize: '1.125rem', fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#fff', userSelect: 'none' }}>
                  {siteName}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* ── ROW 3: RIGHT (End alignment) ────────────────────────────── */}
        <div style={{ position: 'absolute', top: 0, right: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pointerEvents: 'none', paddingRight:'2rem', maxWidth: '42%' }}>
          {/* Mobile: cart only */}
          <div style={{ pointerEvents: 'auto' }} className="flex lg:hidden">
            <CartButton />
          </div>
          {/* Desktop */}
          <div style={{ alignItems: 'center', gap: '0.5rem', pointerEvents: 'auto' }} className="hidden lg:flex">
            {!pathname.startsWith('/products') && <SearchBar />}
            
            <CartButton />

            {/* Auth buttons */}
            {isAuth ? (
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
                style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0,padding: '0.5rem' }}
              >
                Logout
              </Button>
            ) : (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
                style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0, padding: '0.5rem' }}
              >
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
