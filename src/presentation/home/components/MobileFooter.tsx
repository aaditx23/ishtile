'use client';

import Link from 'next/link';
import { FiFacebook, FiInstagram, FiMessageCircle, FiPhone } from 'react-icons/fi';

interface FooterLink {
  label: string;
  href: string;
}

interface MobileFooterProps {
  phoneDialUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  whatsappUrl: string;
  obscuraUrl: string;
  obscuraLogoSrc: string;
  links: FooterLink[];
}

export default function MobileFooter({
  phoneDialUrl,
  facebookUrl,
  instagramUrl,
  whatsappUrl,
  obscuraUrl,
  obscuraLogoSrc,
  links,
}: MobileFooterProps) {
  return (
    <div className="lg:hidden" style={{ padding: '2rem 1rem', backgroundColor: '#FAF5F1' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <a
          href={phoneDialUrl}
          aria-label="Contact us by phone"
          style={{
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '56px',
            borderRadius: '999px',
            backgroundColor: '#D6CEBF',
            padding: '0 14px 0 18px',
            gap: '10px',
            color: '#232323',
            textDecoration: 'none',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '16px',
          }}
        >
          <span style={{ opacity: 1 }}>Contact us</span>
          <FiPhone size={18} color="#322f26" />
        </a>
        <div style={{ height: '16px' }} />
        <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ color: '#232323' }}>
            <FiFacebook size={24} />
          </a>
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: '#232323' }}>
            <FiInstagram size={24} />
          </a>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" style={{ color: '#232323' }}>
            <FiMessageCircle size={24} />
          </a>
        </div>
        <nav aria-label="Footer links" style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '0.9rem' }}>
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              style={{
                fontFamily: '"Helvetica Neue", "DM Sans", sans-serif',
                fontWeight: 400,
                fontSize: '13px',
                lineHeight: '16px',
                color: '#232323',
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        

        <p style={{ width: '100%', textAlign: 'center', fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '10px', lineHeight: '16px', color: '#232323', opacity: 0.65 }}>
          © Copyright {new Date().getFullYear()} - Ishtile
        </p>
        <div style={{ height: '8px' }} />
        <a
          href={obscuraUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Developed by Obscura IT"
          style={{
            marginTop: '0.4rem',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent:'center',
            gap: '0.45rem',
            color: '#232323',
            textDecoration: 'none',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '10px',
            lineHeight: '14px',
            

          }}
        >
          <span>Developed by Obscura IT</span>
        </a>
        <div style={{ height: '48px' }} />
        <div
          aria-hidden="true"
          style={{
            width: '100%',
            userSelect: 'none',
            pointerEvents: 'none',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/footer_logo_mobile.png"
            alt=""
            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
          />
        </div>
        <div style={{ height: '16px' }} />
      </div>
    </div>
  );
}
