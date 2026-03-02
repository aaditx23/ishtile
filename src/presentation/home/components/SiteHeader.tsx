'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { SearchIcon, BookmarkIcon, PersonIcon, BagIcon, HamburgerIcon } from '@/components/icons';

// ── Logo SVG ──────────────────────────────────────────────────────────────────
function PandCoLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 85 18"
      width="85"
      height="18"
      aria-label="Ishtile"
      className={className}
      fill="currentColor"
    >
      <text
        x="0"
        y="14"
        fontFamily="system-ui, sans-serif"
        fontWeight="900"
        fontSize="16"
        letterSpacing="1"
      >
        ISHTILE
      </text>
    </svg>
  );
}

// ── Left Nav ──────────────────────────────────────────────────────────────────
const leftNavItems = [
  { label: 'MENS',     href: '/collections/mens' },
  { label: 'WOMENS',   href: '/collections/womens' },
  { label: 'GOODS',    href: '/collections/goods' },
  { label: 'LOOKBOOK', href: '/blogs/lookbook' },
];

const rightNavTextLinks = [
  { label: 'BRAND',   href: '/pages/manifesto' },
  { label: 'REWARDS', href: '/pages/rewards' },
];

const allMobileNavItems = [...leftNavItems, ...rightNavTextLinks];

// ── Main Header ───────────────────────────────────────────────────────────────
export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [cartCount] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const headerBg = scrolled ? 'bg-[#1C1A19]' : 'bg-transparent';

  return (
    <header
      className={`fixed top-0 left-20 right-20 z-50 transition-colors duration-300 text-white rounded-b-2xl ${headerBg}`}
      style={{ height: '60px' }}
    >
      <div className="w-full h-full px-6 flex items-center justify-between" >

        {/* ── Mobile: Sheet drawer ── */}
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                <HamburgerIcon />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <nav>
                <ul className="flex flex-col gap-1">
                  {allMobileNavItems.map((item) => (
                    <li key={item.label}>
                      <Button asChild variant="ghost">
                        <Link href={item.href}>{item.label}</Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* ── Left Nav (desktop) ── */}
        <nav className="hidden lg:flex items-center gap-8" aria-label="Main left navigation">
          <ul className="flex gap-8 list-none">
            {leftNavItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  style={{padding: '0 0.75rem'}}
                  className="text-xs font-semibold uppercase tracking-widest hover:border-b hover:border-white transition-all duration-200"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Center Logo ── */}
        <Link
          href="/"
          className="absolute left-1/2 -translate-x-1/2 flex items-center text-white"
          aria-label="Home"
        >
          <PandCoLogo />
        </Link>

        {/* ── Right Nav (desktop) ── */}
        <div className="hidden lg:flex items-center gap-6">
          {rightNavTextLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-xs font-semibold uppercase tracking-widest hover:border-b hover:border-white transition-all duration-200"
            >
              {item.label}
            </Link>
          ))}

          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="icon" aria-label="Search">
              <Link href="/search"><SearchIcon /></Link>
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="Wishlist">
              <Link href="/pages/wishlist"><BookmarkIcon /></Link>
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="Account">
              <Link href="/account"><PersonIcon /></Link>
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="Bag">
              <Link href="/cart">
                <BagIcon />
                {cartCount > 0 && (
                  <Badge>{cartCount}</Badge>
                )}
              </Link>
            </Button>
          </div>
        </div>

        {/* ── Mobile: right icons ── */}
        <div className="lg:hidden flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Search">
            <SearchIcon />
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label="Bag">
            <Link href="/cart">
              <BagIcon />
              {cartCount > 0 && (
                <Badge>{cartCount}</Badge>
              )}
            </Link>
          </Button>
        </div>

      </div>
    </header>
  );
}
