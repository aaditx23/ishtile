'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SearchIcon } from '@/components/icons';

interface SearchBarProps {
  variant?: 'desktop' | 'mobile';
}

export function SearchBar({ variant = 'desktop' }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { 
    setSearchQuery(searchParams.get('search') ?? ''); 
  }, [searchParams]);

  useEffect(() => { 
    if (searchOpen) inputRef.current?.focus(); 
  }, [searchOpen]);

  useEffect(() => { 
    setSearchOpen(false); 
  }, [pathname]);

  const openSearch = () => setSearchOpen(true);
  const closeSearch = () => { 
    setSearchOpen(false); 
    setSearchQuery(''); 
  };
  
  const submitSearch = () => {
    const q = searchQuery.trim();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
    setSearchOpen(false);
  };

  if (variant === 'mobile') {
    return (
      <div className="w-full px-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitSearch(); }}
              placeholder="Search products…"
              className="h-10 w-full bg-white/10 border-white/20 pl-10 pr-3 text-sm text-white placeholder:text-white/50"
            />
          </div>
          <Button
            onClick={submitSearch}
            variant="default"
            size="default"
            className="h-10 px-6 bg-white/10 hover:bg-white/20 text-white border border-white/20"
            style={{padding:'0.5rem'}}
          >
            Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {searchOpen ? (
        <div className="flex items-center gap-4">
          <div className="relative w-48 sm:w-64">
            <Input
              ref={inputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitSearch(); if (e.key === 'Escape') closeSearch(); }}
              placeholder="Search products…"
              
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={closeSearch}
            className="text-white/50 hover:text-white/70 text-xs hidden sm:flex"
            style={{padding:'1rem'}}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button 
          variant="ghost" 
          size="icon" 
          aria-label="Search" 
          onClick={openSearch} 
          className="text-white hover:bg-white/10"
        >
          <SearchIcon />
        </Button>
      )}
    </>
  );
}
