'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { FiFacebook, FiInstagram, FiMessageCircle, FiPhone } from 'react-icons/fi';
import MobileFooter from './MobileFooter';

export default function SiteFooter() {
  const desktopFrameRef = useRef<HTMLDivElement>(null);
  const [desktopScale, setDesktopScale] = useState(1);

  useEffect(() => {
    const DESIGN_WIDTH = 1920;

    const recalc = () => {
      const node = desktopFrameRef.current;
      if (!node) return;
      const width = node.clientWidth;
      if (!width) return;
      setDesktopScale(width / DESIGN_WIDTH);
    };

    recalc();
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, []);

  const obscuraUrl = 'https://www.facebook.com/obscuraitbd';
  const obscuraLogoSrc = '/images/obscura.png';
  const ishtileWordmarkSrc = '/images/ishtile.png';

  const facebookUrl = process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_URL || 'https://facebook.com';
  const instagramUrl = process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL || 'https://instagram.com';
  const whatsappNumberRaw = process.env.NEXT_PUBLIC_SOCIAL_WHATSAPP_NUMBER || '';
  const whatsappNumber = whatsappNumberRaw.replace(/\D/g, '');
  const whatsappUrl = whatsappNumber ? `https://wa.me/${whatsappNumber}` : 'https://wa.me/';
  const phoneDialUrl = whatsappNumber ? `tel:+${whatsappNumber}` : 'tel:';

  const links = [
    { label: 'Home', href: '/' },
    { label: 'Lookbook', href: '/lookbook' },
    { label: 'Trending', href: '/products?trending=true' },
    { label: 'Shop', href: '/products' },

  ];

  return (
    <footer style={{ backgroundColor: '#FAF5F1', color: '#232323' }}>
      <div
        ref={desktopFrameRef}
        className="hidden lg:block"
        style={{
          position: 'relative',
          width: '100%',
          height: `${507 * desktopScale}px`,
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backgroundColor: '#FDF7E6', opacity: 0.35 }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.1, background: 'linear-gradient(180deg, #F0E8DA 0%, rgba(240,232,218,0) 60%)' }} />
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '1920px',
            height: '507px',
            transform: `scale(${desktopScale})`,
            transformOrigin: 'top left',
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: '100%',
              opacity: 0.32,
              background: 'radial-gradient(60% 60% at 35% 40%, rgba(214,206,191,0.75) 0%, rgba(214,206,191,0.15) 55%, rgba(214,206,191,0) 100%)',
            }}
          />
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: 0,
                bottom: '18px',
                width: '50%',
                margin: 0,
                opacity: 0.98,
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ishtileWordmarkSrc}
                alt=""
                style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
              />
            </div>

          <div style={{ position: 'absolute', width: '65%', height: '100%', margin: '0 auto' }}>
            <p
              style={{
                position: 'absolute',
                width: '100%',
                top: '35px',
                fontFamily: '"Doppio One", "Anton", sans-serif',
                fontWeight: 400,
                fontSize: '65px',

                textAlign: 'right',
                color: '#010000',
              }}
            >
              <span style={{ display: 'block' }}>Purveyors of fine labels. </span>
              <span style={{ display: 'block' }}>The absolute</span>
            </p>

            <div style={{ position: 'absolute', width: '499px', left: '1305px', top: '68px' }}>
              <a
                href={phoneDialUrl}
                aria-label="Contact us by phone"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '71px',
                  borderRadius: '36px',
                  backgroundColor: '#D6CEBF',
                  padding: '0 22px 0 29px',
                  gap: '12px',
                  color: '#232323',
                  textDecoration: 'none',
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '18px',
                  lineHeight: '23px',
                }}
              >
                <span style={{ opacity: 1 }}>Contact us</span>
              <FiPhone size={18} color="#322f26" />
              </a>
            </div>

            <div style={{ position: 'absolute', width: '186px', left: '1473px', top: '215px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ color: '#232323' }}>
                <FiFacebook size={42} />
              </a>
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: '#232323' }}>
                <FiInstagram size={42} />
              </a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" style={{ color: '#232323' }}>
                <FiMessageCircle size={42} />
              </a>
            </div>

            <div style={{ position: 'absolute', width: '562px', left: '1285px', bottom: '72px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <nav aria-label="Footer links" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
                {links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    style={{
                      fontFamily: '"Helvetica Neue", "DM Sans", sans-serif',
                      fontWeight: 400,
                      fontSize: '14px',
                      lineHeight: '17px',
                      color: '#232323',
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <p style={{ margin: '6px 0 0', fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: '12px', lineHeight: '16px', color: '#232323', opacity: 0.65, paddingTop:'1rem' }}>
                © Copyright 2026 - Ishtile
              </p>

              <a
                href={obscuraUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Developed by Obscura IT"
                style={{
                  marginTop: '22px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  color: '#232323',
                  textDecoration: 'none',
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '11px',
                  lineHeight: '14px',
                  paddingTop:'1rem'
                  
                }}
              >
                <span>Developed by </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={obscuraLogoSrc}
                  alt="Obscura IT logo"
                  style={{ width: '55px', height: '55px', objectFit: 'contain' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </a>
            </div>
          </div>
        </div>
      </div>

      <MobileFooter
        phoneDialUrl={phoneDialUrl}
        facebookUrl={facebookUrl}
        instagramUrl={instagramUrl}
        whatsappUrl={whatsappUrl}
        obscuraUrl={obscuraUrl}
        obscuraLogoSrc={obscuraLogoSrc}
        links={links}
      />
    </footer>
  );
}
