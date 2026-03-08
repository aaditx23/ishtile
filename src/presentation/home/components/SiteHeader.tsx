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
import { MobileNav } from './MobileNav';
import { SearchBar } from './SearchBar';
import { CartButton } from './CartButton';

/* ─── Link data ────────────────────────────────────────────────────────────── */

const SHOP_LINKS = [
  { label: 'Shop', href: '/products' },
];

const USER_LINKS = [
  { label: 'Profile',    href: '/profile' },
  { label: 'My Orders',  href: '/orders' },
  { label: 'Favourites', href: '/favourites' },
];

/* ─── SiteHeader ───────────────────────────────────────────────────────────── */

export default function SiteHeader() {
  const auth         = useCurrentUser();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);

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
        background: scrolled ? 'var(--brand-dark)' : 'rgba(28,26,25,0.9)',
        backdropFilter: scrolled ? 'none' : 'blur(8px)',
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
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', pointerEvents: 'none', paddingLeft: '1rem' }}>
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
                    Ishtile
                  </SheetTitle>
                  
                  <MobileNav
                    isAuth={isAuth}
                    isAdmin={isAdmin}
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
                    <Link href={link.href} legacyBehavior passHref>
                      <NavigationMenuLink
                        active={isLinkActive(link.href)}
                        className="h-auto px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.1em] hover:bg-transparent data-[active]:bg-transparent data-[active]:border-b data-[active]:border-white data-[active]:rounded-none data-[active]:text-white hover:text-white text-neutral-300"
                        style={{paddingLeft:'0.5rem', paddingRight:'0.5rem' }}
                      >
                        {link.label}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                ))}
                
                {isAuth && (
                  <>
                    <div className="w-px h-4 bg-white/20 mx-3" />
                    {USER_LINKS.map((link) => (
                      <NavigationMenuItem key={link.href}>
                        <Link href={link.href} legacyBehavior passHref>
                          <NavigationMenuLink
                            active={isLinkActive(link.href)}
                            className="h-auto px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.1em] hover:bg-transparent data-[active]:bg-transparent data-[active]:border-b data-[active]:border-white data-[active]:rounded-none data-[active]:text-white hover:text-white text-neutral-300"
                            style={{paddingLeft:'0.5rem', paddingRight:'0.5rem' }}  
                          >
                            {link.label}
                          </NavigationMenuLink>
                        </Link>
                      </NavigationMenuItem>
                    ))}
                  </>
                )}
                
                {isAdmin && (
                  <>
                    <div className="w-px h-4 bg-white/20 mx-3" />
                    <NavigationMenuItem>
                      <Link href="/admin" legacyBehavior passHref>
                        <NavigationMenuLink
                          active={pathname === '/admin' || pathname.startsWith('/admin/')}
                          style={{paddingLeft:'0.5rem', paddingRight:'0.5rem' }}
                          className="h-auto px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.1em] hover:bg-transparent data-[active]:bg-transparent data-[active]:border-b data-[active]:border-white data-[active]:rounded-none data-[active]:text-white hover:text-white text-[var(--brand-gold)]"
                        >
                          Dashboard
                        </NavigationMenuLink>
                      </Link>
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
            <Link href="/" aria-label="Ishtile Home" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: '1.125rem', fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#fff', userSelect: 'none' }}>
                Ishtile
              </span>
            </Link>
          </div>
        </div>

        {/* ── ROW 3: RIGHT (End alignment) ────────────────────────────── */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pointerEvents: 'none', paddingRight:'2rem' }}>
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
