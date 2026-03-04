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

/* ─── Sub-components ───────────────────────────────────────────────────────── */

function NavLink({ href, label, gold }: { href: string; label: string; gold?: boolean }) {
  const pathname = usePathname();
  const base = href.split('?')[0];
  const active = pathname === base || pathname.startsWith(base + '/');

  return (
    <Link
      href={href}
      style={{
        fontSize: '0.7rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        whiteSpace: 'nowrap',
        textDecoration: 'none',
        borderBottom: active ? '1px solid #fff' : 'none',
        paddingBottom: active ? '1px' : 0,
        color: active ? '#fff' : gold ? 'var(--brand-gold)' : '#d4d4d4',
        transition: 'color 150ms',
      }}
    >
      {label}
    </Link>
  );
}

function NavDivider() {
  return <span style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />;
}

function MobileNavItem({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  const pathname = usePathname();
  const base = href.split('?')[0];
  const active = pathname === base || pathname.startsWith(base + '/');

  return (
    <li>
      <Link
        href={href}
        onClick={onClick}
        style={{
          display: 'block',
          padding: '0.6rem 0.75rem',
          fontSize: '0.85rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          borderRadius: '0.5rem',
          textDecoration: 'none',
          color: active ? '#fff' : '#d4d4d4',
          background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
        }}
      >
        {label}
      </Link>
    </li>
  );
}

function MobileSectionLabel({ label }: { label: string }) {
  return (
    <li style={{ paddingTop: '1rem', paddingBottom: '0.25rem', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
      <span style={{ paddingLeft: '0.75rem', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#737373' }}>
        {label}
      </span>
    </li>
  );
}

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
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* ── LEFT ────────────────────────────── */}
        <div style={{ flex: '1 1 0%', display: 'flex', alignItems: 'center', minWidth: 0 }}>

          {/* Mobile hamburger — hidden on ≥1024px */}
          <div style={{ display: 'flex', alignItems: 'center' }} className="lg:!hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu" className="text-white hover:bg-white/10" style={{marginRight:'1rem'}} >
                  <HamburgerIcon />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-[var(--brand-dark)] text-white border-r border-white/10 w-72 overflow-y-auto">
                <SheetTitle className="text-white tracking-widest text-sm uppercase font-black mb-6 text-center" style={{paddingTop:'1rem'}}>Ishtile</SheetTitle>
                <nav>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '2px', listStyle: 'none', padding: 0, margin: 0 }}>
                    <MobileSectionLabel label="Shop" />
                    {SHOP_LINKS.map((l) => <MobileNavItem key={l.href} {...l} onClick={closeMobile} />)}
                    {isAuth && (
                      <>
                        <MobileSectionLabel label="My Account" />
                        {USER_LINKS.map((l) => <MobileNavItem key={l.href} {...l} onClick={closeMobile} />)}
                      </>
                    )}
                    {isAdmin && (
                      <>
                        <MobileSectionLabel label="Admin" />
                        <MobileNavItem href="/admin" label="Dashboard" onClick={closeMobile} />
                      </>
                    )}
                    <MobileSectionLabel label="" />
                    {isAuth
                      ? <MobileNavItem href="/profile" label="Sign Out" onClick={closeMobile} />
                      : <MobileNavItem href="/login" label="Sign In" onClick={closeMobile} />
                    }
                  </ul>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop nav (hidden below lg) */}
          <nav className="hidden lg:flex" style={{ alignItems: 'center', gap: '1.25rem' }}>
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
                <NavLink href="/admin" label="Dashboard" gold />
              </>
            )}
          </nav>
        </div>

        {/* ── CENTER: Logo ────────────────────── */}
        <div style={{ flex: '0 0 auto', padding: '0 1.5rem' }}>
          <Link href="/" aria-label="Ishtile Home" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '1.125rem', fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#fff', userSelect: 'none' }}>
              Ishtile
            </span>
          </Link>
        </div>

        {/* ── RIGHT ───────────────────────────── */}
        <div style={{ flex: '1 1 0%', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem', minWidth: 0 }}>

          {searchOpen ? (
            <div style={{ display: 'flex', flex: '1 1 0%', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: '1 1 0%' }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', pointerEvents: 'none', display: 'flex' }}>
                  <SearchIcon />
                </span>
                <input
                  ref={inputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') submitSearch(); if (e.key === 'Escape') closeSearch(); }}
                  placeholder="Search products…"
                  style={{
                    width: '100%',
                    height: '2rem',
                    borderRadius: '0.375rem',
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    paddingLeft: '2.25rem',
                    paddingRight: '0.75rem',
                    fontSize: '0.85rem',
                    color: '#fff',
                    outline: 'none',
                  }}
                />
              </div>
              <button
                onClick={closeSearch}
                style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: '0 0.25rem' }}
              >
                Cancel
              </button>
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
        </div>
      </div>
    </header>
  );
}
