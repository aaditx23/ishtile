'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import { SearchBar } from './SearchBar';
import { tokenStore } from '@/infrastructure/auth/tokenStore';

/* ─── Link data ────────────────────────────────────────────────────────────── */

const SHOP_LINKS = [
  { label: 'Shop', href: '/products' },
];

const USER_LINKS = [
  { label: 'Profile',    href: '/profile' },
  { label: 'My Orders',  href: '/orders' },
  { label: 'Favourites', href: '/favourites' },
];

/* ─── MobileNav ────────────────────────────────────────────────────────────── */

interface MobileNavProps {
  isAuth: boolean;
  isAdmin: boolean;
  pathname: string;
  isLinkActive: (href: string) => boolean;
  onClose: () => void;
}

export function MobileNav({ isAuth, isAdmin, pathname, isLinkActive, onClose }: MobileNavProps) {
  const handleLogout = () => {
    tokenStore.clearAll();
    window.location.href = '/';
  };

  return (
    <div className="flex flex-col gap-1" style={{padding:'1rem'}}>
      {/* Search */}
      <div className="pt-2 pb-3">
        <SearchBar variant="mobile" />
      </div>

      {/* Auth Button */}
      <div className="pb-3">
        {isAuth ? (
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-white hover:bg-white/10 h-auto px-3 py-3"
          >
            <span className="text-[0.85rem] font-semibold uppercase tracking-[0.1em]">
              Logout
            </span>
          </Button>
        ) : (
          <Button
            asChild
            variant="ghost"
            className="w-full justify-start text-white hover:bg-white/10 h-auto px-3 py-3"
          >
            <Link href="/login">
              <span className="text-[0.85rem] font-semibold uppercase tracking-[0.1em]">
                Login
              </span>
            </Link>
          </Button>
        )}
      </div>

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
                  active={isLinkActive(link.href)}
                  onClick={onClose}
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
                      active={isLinkActive(link.href)}
                      onClick={onClose}
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
                    onClick={onClose}
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
    </div>
  );
}
