'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import { SearchIcon, BagIcon, HamburgerIcon } from '@/components/icons';
import { useCartCount } from '@/presentation/shared/hooks/useCartCount';
import { useCurrentUser } from '@/presentation/shared/hooks/useCurrentUser';
import { tokenStore } from '@/infrastructure/auth/tokenStore';

/* ─── Link data ────────────────────────────────────────────────────────────── */

const SHOP_LINKS = [
  { label: 'Shop',   href: '/products' },
  { label: 'New In', href: '/products?sort=newest' },
  { label: 'Sale',   href: '/products?sale=true' },
];

const USER_LINKS = [
  { label: 'Profile',    href: '/profile' },
  { label: 'My Orders',  href: '/orders' },
  { label: 'Favourites', href: '/favourites' },
];

/* ─── SiteHeader ───────────────────────────────────────────────────────────── */

export default function SiteHeader() {
  const cartCount    = useCartCount();
  const auth         = useCurrentUser();
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isAuth  = auth.status === 'authenticated';
  const isAdmin = isAuth && auth.user.role === 'admin';

  useEffect(() => { setSearchQuery(searchParams.get('search') ?? ''); }, [searchParams]);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  useEffect(() => { if (searchOpen) inputRef.current?.focus(); }, [searchOpen]);
  useEffect(() => { setSearchOpen(false); }, [pathname]);

  const openSearch  = () => setSearchOpen(true);
  const closeSearch = () => { setSearchOpen(false); setSearchQuery(''); };
  const submitSearch = () => {
    const q = searchQuery.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
    setSearchOpen(false);
  };
  const closeMobile = () => setMobileOpen(false);
  
  const handleLogout = () => {
    tokenStore.clearAll();
    router.push('/');
    router.refresh();
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
          height: '100%',
          padding: '2rem',
          
        }}
      >
        {/* ── ROW 1: LEFT (Start alignment) ────────────────────────────── */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', pointerEvents: 'none', paddingLeft:'1rem', paddingRight:'1rem' }}>
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
                  
                  <div className="flex flex-col gap-1">
                    {/* Shop Section */}
                    <div className="pt-4 pb-1 mt-2 border-t border-white/10">
                      <span className="pl-3 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-neutral-500">
                        Shop
                      </span>
                    </div>
                    <NavigationMenu orientation="vertical" viewport={false}>
                      <NavigationMenuList className="flex-col items-stretch space-x-0 gap-0.5">
                        {SHOP_LINKS.map((link) => (
                          <NavigationMenuItem key={link.href} className="w-full">
                            <Link href={link.href} legacyBehavior passHref>
                              <NavigationMenuLink
                                active={pathname === link.href.split('?')[0] || pathname.startsWith(link.href.split('?')[0] + '/')}
                                onClick={closeMobile}
                                className="block w-full px-3 py-2.5 text-[0.85rem] font-semibold uppercase tracking-[0.1em] rounded-lg data-[active]:bg-white/10 data-[active]:text-white hover:bg-white/5 text-neutral-300"
                              >
                                {link.label}
                              </NavigationMenuLink>
                            </Link>
                          </NavigationMenuItem>
                        ))}
                      </NavigationMenuList>
                    </NavigationMenu>

                    {/* My Account Section */}
                    {isAuth && (
                      <>
                        <div className="pt-4 pb-1 mt-2 border-t border-white/10">
                          <span className="pl-3 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-neutral-500">
                            My Account
                          </span>
                        </div>
                        <NavigationMenu orientation="vertical" viewport={false}>
                          <NavigationMenuList className="flex-col items-stretch space-x-0 gap-0.5">
                            {USER_LINKS.map((link) => (
                              <NavigationMenuItem key={link.href} className="w-full">
                                <Link href={link.href} legacyBehavior passHref>
                                  <NavigationMenuLink
                                    active={pathname === link.href.split('?')[0] || pathname.startsWith(link.href.split('?')[0] + '/')}
                                    onClick={closeMobile}
                                    className="block w-full px-3 py-2.5 text-[0.85rem] font-semibold uppercase tracking-[0.1em] rounded-lg data-[active]:bg-white/10 data-[active]:text-white hover:bg-white/5 text-neutral-300"
                                  >
                                    {link.label}
                                  </NavigationMenuLink>
                                </Link>
                              </NavigationMenuItem>
                            ))}
                          </NavigationMenuList>
                        </NavigationMenu>
                      </>
                    )}

                    {/* Admin Section */}
                    {isAdmin && (
                      <>
                        <div className="pt-4 pb-1 mt-2 border-t border-white/10">
                          <span className="pl-3 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-neutral-500">
                            Admin
                          </span>
                        </div>
                        <NavigationMenu orientation="vertical" viewport={false}>
                          <NavigationMenuList className="flex-col items-stretch space-x-0 gap-0.5">
                            <NavigationMenuItem className="w-full">
                              <Link href="/admin" legacyBehavior passHref>
                                <NavigationMenuLink
                                  active={pathname === '/admin' || pathname.startsWith('/admin/')}
                                  onClick={closeMobile}
                                  className="block w-full px-3 py-2.5 text-[0.85rem] font-semibold uppercase tracking-[0.1em] rounded-lg data-[active]:bg-white/10 data-[active]:text-white hover:bg-white/5 text-neutral-300"
                                >
                                  Dashboard
                                </NavigationMenuLink>
                              </Link>
                            </NavigationMenuItem>
                          </NavigationMenuList>
                        </NavigationMenu>
                      </>
                    )}

                    {/* Auth Section */}
                    <div className="pt-4 pb-1 mt-2 border-t border-white/10" />
                    <NavigationMenu orientation="vertical" viewport={false}>
                      <NavigationMenuList className="flex-col items-stretch space-x-0 gap-0.5">
                        <NavigationMenuItem className="w-full">
                          <Link href={isAuth ? "/profile" : "/login"} legacyBehavior passHref>
                            <NavigationMenuLink
                              onClick={closeMobile}
                              className="block w-full px-3 py-2.5 text-[0.85rem] font-semibold uppercase tracking-[0.1em] rounded-lg hover:bg-white/5 text-neutral-300"
                            >
                              {isAuth ? "Sign Out" : "Sign In"}
                            </NavigationMenuLink>
                          </Link>
                        </NavigationMenuItem>
                      </NavigationMenuList>
                    </NavigationMenu>
                  </div>
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
                        active={pathname === link.href.split('?')[0] || pathname.startsWith(link.href.split('?')[0] + '/')}
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
                            active={pathname === link.href.split('?')[0] || pathname.startsWith(link.href.split('?')[0] + '/')}
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
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', pointerEvents: 'none', paddingLeft:'1rem', paddingRight:'1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', pointerEvents: 'auto' }}>
            {searchOpen ? (
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none flex">
                    <SearchIcon />
                  </span>
                  <Input
                    ref={inputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') submitSearch(); if (e.key === 'Escape') closeSearch(); }}
                    placeholder="Search products…"
                    className="h-8 w-full bg-white/10 border-white/20 pl-9 pr-3 text-sm text-white placeholder:text-white/50"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeSearch}
                  className="text-white/50 hover:text-white/70 text-xs"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="icon" aria-label="Search" onClick={openSearch} className="text-white hover:bg-white/10">
                <SearchIcon />
              </Button>
            )}

            <Button asChild variant="ghost" size="icon" aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`} className="relative text-white hover:bg-white/10" style={{ flexShrink: 0 }}>
              <Link href="/cart">
                <BagIcon />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] leading-none flex items-center justify-center rounded-full bg-[var(--brand-gold)] text-black border-0">
                    {cartCount > 99 ? '99+' : cartCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* Auth buttons */}
            {isAuth ? (
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
                style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0, padding:'1rem'  }}
              >
                Logout
              </Button>
            ) : (
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10"
                style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0, padding:'1rem' }}
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
