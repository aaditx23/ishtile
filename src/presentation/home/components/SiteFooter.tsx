'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiInstagram, FiFacebook, FiMessageCircle } from 'react-icons/fi';
import { Separator } from '@/components/ui/separator';
import { Marquee } from '@/components/ui/marquee';
import { getCategories } from '@/application/category/getCategories';
import { getBrands } from '@/application/brand/getBrands';

function FooterColumn({
  title,
  links,
  seeMoreHref,
}: {
  title: string;
  links: { label: string; href: string }[];
  seeMoreHref?: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white">{title}</p>
      <ul className="flex flex-col gap-2.5">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-sm text-neutral-400 hover:text-white transition-colors duration-150"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
      {seeMoreHref && (
        <Link href={seeMoreHref} className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400 hover:text-white transition-colors duration-150">
          See more
        </Link>
      )}
    </div>
  );
}

export default function SiteFooter() {
  const [categoryLinks, setCategoryLinks] = useState<{ label: string; href: string }[]>([]);
  const [brandLinks, setBrandLinks] = useState<{ label: string; href: string }[]>([]);

  const facebookUrl = process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_URL || 'https://facebook.com';
  const instagramUrl = process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL || 'https://instagram.com';
  const whatsappNumberRaw = process.env.NEXT_PUBLIC_SOCIAL_WHATSAPP_NUMBER || '';
  const whatsappNumber = whatsappNumberRaw.replace(/\D/g, '');
  const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}` : 'https://wa.me/';

  const socialLinks = [
    { label: 'Facebook', href: facebookUrl, Icon: FiFacebook },
    { label: 'Instagram', href: instagramUrl, Icon: FiInstagram },
    { label: 'WhatsApp', href: whatsappUrl, Icon: FiMessageCircle },
  ];

  useEffect(() => {
    let isMounted = true;

    const fetchFooterData = async () => {
      try {
        const [categories, brands] = await Promise.all([
          getCategories({ activeOnly: true, includeSubcategories: false }),
          getBrands({ activeOnly: true }),
        ]);

        if (!isMounted) return;

        setCategoryLinks(
          categories
            .slice(0, 4)
            .map((category) => ({ label: category.name, href: `/products?category=${encodeURIComponent(category.slug)}` })),
        );

        setBrandLinks(
          brands
            .slice(0, 4)
            .map((brand) => ({ label: brand.name, href: `/products?brand=${encodeURIComponent(brand.slug)}` })),
        );
      } catch {
        if (!isMounted) return;
        setCategoryLinks([]);
        setBrandLinks([]);
      }
    };

    fetchFooterData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <footer style={{ backgroundColor: 'var(--brand-dark)', color: 'var(--on-primary)', padding:'1rem'}}>
      {/* Brand Motto Marquee */}
      <div style={{ padding: '3rem 0', overflow: 'hidden' }}>
        <Marquee duration={40} pauseOnHover>
          <span
            style={{
              fontSize: 'clamp(1.5rem, 6vw, 4rem)',
              fontWeight: 900,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: 'white',
              whiteSpace: 'nowrap',
              paddingRight: '4rem',
            }}
          >
            Forget style, embrace a different kind of IshtiLE!
          </span>
        </Marquee>
      </div>

      {/* Main grid */}
      <div className="px-6 md:px-12 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-4">
            <Link href="/" aria-label="Home">
              <span className="text-2xl font-black uppercase tracking-widest text-white">
                Ishtile
              </span>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-[200px]">
              A mindset for purposeful style. Quality clothing for everyone.
            </p>
          </div>

          {/* Nav columns */}
          <FooterColumn title="Categories" links={categoryLinks} seeMoreHref="/products" />
          <FooterColumn title="Brands" links={brandLinks} seeMoreHref="/products" />

          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white">Social Media</p>
            <ul className="flex flex-col gap-2.5">
              {socialLinks.map(({ label, href, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-neutral-400 hover:text-white transition-colors duration-150 inline-flex items-center gap-2"
                  >
                    <Icon size={14} />
                    <span>{label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Separator className="bg-[#2e2c2b]" style={{marginTop:'0.5rem'}} />

      {/* Bottom bar */}
      <div className="px-6 md:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-neutral-500">
          © {new Date().getFullYear()} Ishtile. All rights reserved.
        </p>
        <div className="flex gap-2">
          <Link href="/pages/privacy" className="text-xs text-neutral-500 hover:text-white transition-colors duration-150">
            Privacy Policy
          </Link>
          <Link href="/pages/terms" className="text-xs text-neutral-500 hover:text-white transition-colors duration-150">
            Terms of Use
          </Link>
        </div>
      </div>
    </footer>
  );
}
