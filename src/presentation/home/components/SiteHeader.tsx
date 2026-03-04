'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { SearchIcon, BagIcon, HamburgerIcon } from '@/components/icons';
import { useCartCount } from '@/presentation/shared/hooks/useCartCount';
import { useCurrentUser } from '@/presentation/shared/hooks/useCurrentUser';

// ─── Link definitions ─────────────────────────────────────────────────────────

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

const ADMIN_LINKS = [
  { label: 'Dashboard', href: '/admin' },
];

// ─── Logo ─────────────────────────────────────────────────────────────────────
function IshtileLogo() {
  return (
    <span className="text-lg font-black tracking-[0.15em] uppercase text-white select-none">
      Ishtile
    </span>
  );
}

// ─── NavLink ──────────────────────────────────────────────────────────────────
function NavLink({ href, label, gold = false }: { href: string; label: string; gold?: boolean }) {
  const pathname = usePathname();
  const base = href.split('?')[0];
  const isActive = pathname === base || pathname.startsWith(base + '/');

  return (
    <Link
      href={href}
      className={`
        text-xs font-semibold uppercase tracking-widest transition-colors duration-150 whitespace-nowrap
        ${isActive
          ? 'text-white border-b border-white pb-px'
          : gold
            ? 'text-[var(--brand-gold)] hover:text-white'
            : 'text-neutral-300 hover:text-white'
        }
      `}
    >
      {label}
    </Link>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
function NavDivider() {
  return <span className="h-4 w-px bg-white/20 mx-1" aria-hidden />;
}

// ─── Mobile nav item ─────────────────────────────────────────────────────────
function MobileNavItem({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  const pathname = usePathname();
  const base = href.split('?')[0];
  const isActive = pathname === base || pathname.startsWith(base + '/');

  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        className={`block px-3 py-2.5 text-sm font-semibold uppercase tracking-widest rounded-lg transition-colors
          ${isActive ? 'text-white bg-white/10' : 'text-neutral-300 hover:text-white hover:bg-white/5'}
        `}
      >
        {label}
      </Link>
    </li>
  );
}

// ─── Mobile section label ────────────────────────────────────────────────────
function MobileSectionLabel({ label }: { label: string }) {
  return (
    <li className="pt-4 pb-1 mt-2 border-t border-white/10">
      <span className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">{label}</span>
    </li>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────
export default function SiteHeader() {
  const cartCount  = useCartCount();
  const auth       = useCurrentUser();
  const router     = useRouter();
  const pathname   = usePathname();
  const searchParams = useSearchParams();

  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isAuth  = auth.status === 'authenticated';
  const isAdmin = isAuth && auth.user.role === 'admin';

  // Keep search query in sync with URL param
  useEffect(() => {
    setSearchQuery(searchParams.get('search') ?? '');
  }, [searchParams]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Close search on route change
  useEffect(() => {
    setSearchOpen(false);
  }, [pathname]);

  const openSearch = () => setSearchOpen(true);
  const closeSearch = () => { setSearchOpen(false); setSearchQuery(''); };

  const submitSearch = () => {
    const q = searchQuery.trim();
    if (q) router.push(`/products?search=${encodeURIComponent(q)}`);
    else router.push('/products');
    setSearchOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <header
      className={`
        fixed inset-x-0 top-0 z-50 h-16
        transition-all duration-300
        ${scrolled ? 'bg-[var(--brand-dark)] shadow-lg' : 'bg-[var(--brand-dark)]/90 backdrop-blur-sm'}
      `}
    >
      <div className="max-w-screen-xl mx-auto h-full px-4 md:px-8 flex items-center justify-between gap-4">

        {/* ── Mobile hamburger ─────────────────────────────────────────────── */}
        <div className="flex items-center lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu" className="text-white hover:bg-white/10">
                <HamburgerIcon />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-[var(--brand-dark)] text-white border-r border-white/10 w-72 overflow-y-auto">
              <SheetTitle className="text-white tracking-widest text-sm uppercase font-black mb-6">
                Ishtile
              </SheetTitle>
              <nav>
                <ul className="flex flex-col gap-0.5">
                  {/* Shop */}
                  <MobileSectionLabel label="Shop" />
                  {SHOP_LINKS.map((l) => <MobileNavItem key={l.href} {...l} onClick={closeMobile} />)}

                  {/* User account links */}
                  {isAuth && (
                    <>
                      <MobileSectionLabel label="My Account" />
                      <MobileNavItem href="/profile" label="Profile" onClick={closeMobile} />
                      {USER_LINKS.map((l) => <MobileNavItem key={l.href} {...l} onClick={closeMobile} />)}
                    </>
                  )}

                  {/* Admin links */}
                  {isAdmin && (
                    <>
                      <MobileSectionLabel label="Admin" />
                      {ADMIN_LINKS.map((l) => <MobileNavItem key={l.href} {...l} onClick={closeMobile} />)}
                    </>
                  )}

                  {/* Auth action */}
                  <MobileSectionLabel label="" />
                  {isAuth ? (
                    <MobileNavItem href="/profile" label="Sign Out" onClick={closeMobile} />
                  ) : (
                    <MobileNavItem href="/login" label="Sign In" onClick={closeMobile} />
                  )}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* ── Logo ─────────────────────────────────────────────────────────── */}
        {!searchOpen && (
          <Link href="/" aria-label="Ishtile Home" className="flex-shrink-0">
            <IshtileLogo />
          </Link>
        )}

        {/* ── Search overlay (expands full width) ──────────────────────────── */}
        {searchOpen ? (
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none">
                <SearchIcon />
              </span>
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitSearch();
                  if (e.key === 'Escape') closeSearch();
                }}
                placeholder="Search products…"
                className="w-full h-9 bg-white/10 border border-white/20 rounded-lg pl-9 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--brand-gold)] focus:bg-white/15 transition-all"
              />
            </div>
            <Button
              onClick={submitSearch}
              size="sm"
              className="bg-[var(--brand-gold)] text-black hover:bg-[var(--brand-gold-hover)] font-semibold text-xs uppercase tracking-wider px-4 shrink-0"
            >
              Search
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeSearch}
              className="text-white/60 hover:text-white hover:bg-white/10 text-xs shrink-0"
              aria-label="Cancel search"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <>
            {/* ── Desktop Nav ─────────────────────────────────────────────── */}
            <nav className="hidden lg:flex items-center gap-6" aria-label="Main navigation">
              {SHOP_LINKS.map((l) => <NavLink key={l.href} {...l} />)}
              {isAuth && (
                <>
                  <NavDivider />
                  {USER_LINKS.map((l) => <NavLink key={l.href} {...l} />)}
                </>
              )}
              {isAdmin && (
                <>
                  <NavDivider />
                  {ADMIN_LINKS.map((l) => <NavLink key={l.href} {...l} gold={true} />)}
                </>
              )}
            </nav>

            {/* ── Right icons ─────────────────────────────────────────────── */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Search"
                onClick={openSearch}
                className="text-white hover:bg-white/10"
              >
                <SearchIcon />
              </Button>

              <Button asChild variant="ghost" size="icon" aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`} className="relative text-white hover:bg-white/10">
                <Link href="/cart">
                  <BagIcon />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] leading-none flex items-center justify-center rounded-full bg-[var(--brand-gold)] text-black border-0">
                      {cartCount > 99 ? '99+' : cartCount}
                    </Badge>
                  )}
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
