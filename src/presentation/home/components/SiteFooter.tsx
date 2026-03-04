import Link from 'next/link';
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import NewsletterForm from './NewsletterForm';

const shopLinks = [
  { label: "Men's",       href: '/collections/men' },
  { label: "Women's",     href: '/collections/women' },
  { label: 'Unisex',      href: '/collections/unisex' },
  { label: 'New Arrivals',href: '/collections/new-arrivals' },
  { label: 'Sale',        href: '/collections/sale' },
];

const companyLinks = [
  { label: 'About',       href: '/pages/about' },
  { label: 'Manifesto',   href: '/pages/manifesto' },
  { label: 'Journal',     href: '/blogs/journal' },
  { label: 'Lookbook',    href: '/blogs/lookbook' },
];

const helpLinks = [
  { label: 'FAQ',          href: '/pages/faq' },
  { label: 'Shipping',     href: '/pages/shipping' },
  { label: 'Returns',      href: '/pages/returns' },
  { label: 'Size Guide',   href: '/pages/size-guide' },
  { label: 'Contact Us',   href: '/pages/contact' },
];

const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com', Icon: FiInstagram },
  { label: 'Facebook',  href: 'https://facebook.com',  Icon: FiFacebook },
  { label: 'Twitter',   href: 'https://twitter.com',   Icon: FiTwitter },
  { label: 'YouTube',   href: 'https://youtube.com',   Icon: FiYoutube },
];

function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
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
    </div>
  );
}

export default function SiteFooter() {
  return (
    <footer style={{ backgroundColor: 'var(--brand-dark)', color: 'var(--on-primary)', padding:'1rem'}}>
      {/* Main grid */}
      <div className="px-6 md:px-12 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1 flex flex-col gap-6">
            <Link href="/" aria-label="Home">
              <span className="text-2xl font-black uppercase tracking-widest text-white">
                Ishtyle
              </span>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-[200px]">
              A mindset for purposeful style. Quality clothing for everyone.
            </p>
            {/* Newsletter */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white">
                Stay in the loop
              </p>
              <NewsletterForm />
            </div>
            {/* Socials */}
            <div className="flex gap-3">
              {socialLinks.map(({ label, href, Icon }) => (
                <Button
                  key={label}
                  asChild
                  variant="ghost"
                  size="icon"
                  className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-400 hover:bg-[#A58C69] hover:text-white"
                  aria-label={label}
                >
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    <Icon size={15} />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          <FooterColumn title="Shop"    links={shopLinks} />
          <FooterColumn title="Company" links={companyLinks} />
          <FooterColumn title="Help"    links={helpLinks} />
        </div>
      </div>

      <Separator className="bg-[#2e2c2b]" style={{marginTop:'0.5rem'}} />

      {/* Bottom bar */}
      <div className="px-6 md:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-xs text-neutral-500">
          © {new Date().getFullYear()} Ishtyle. All rights reserved.
        </p>
        <div className="flex gap-2">
          <Button asChild variant="link" size="sm" className="text-xs text-neutral-500 hover:text-white px-0 h-auto">
            <Link href="/pages/privacy">Privacy Policy</Link>
          </Button>
          <Button asChild variant="link" size="sm" className="text-xs text-neutral-500 hover:text-white px-0 h-auto">
            <Link href="/pages/terms">Terms of Use</Link>
          </Button>
        </div>
      </div>
    </footer>
  );
}
