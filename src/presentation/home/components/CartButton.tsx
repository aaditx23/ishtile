'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BagIcon } from '@/components/icons';
import { useCartCount } from '@/presentation/shared/hooks/useCartCount';

interface CartButtonProps {
  variant?: 'desktop' | 'mobile';
  onClose?: () => void;
}

export function CartButton({ variant = 'desktop', onClose }: CartButtonProps) {
  const cartCount = useCartCount();

  if (variant === 'mobile') {
    return (
      <Link 
        href="/cart" 
        onClick={onClose}
        className="flex items-center justify-between w-full px-3 py-3 rounded-lg hover:bg-white/5 text-neutral-300"
      >
        <span className="text-[0.85rem] font-semibold uppercase tracking-[0.1em]">
          Cart
        </span>
        {cartCount > 0 && (
          <Badge className="h-5 min-w-5 px-1.5 text-[10px] leading-none flex items-center justify-center rounded-full bg-[var(--brand-gold)] text-black border-0">
            {cartCount > 99 ? '99+' : cartCount}
          </Badge>
        )}
      </Link>
    );
  }

  return (
    <Button 
      asChild 
      variant="ghost" 
      size="icon" 
      aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`} 
      className="relative text-white hover:bg-white/10" 
      style={{ flexShrink: 0 }}
    >
      <Link href="/cart">
        <BagIcon />
        {cartCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] leading-none flex items-center justify-center rounded-full bg-[var(--brand-gold)] text-black border-0">
            {cartCount > 99 ? '99+' : cartCount}
          </Badge>
        )}
      </Link>
    </Button>
  );
}
