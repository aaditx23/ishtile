'use client';

import Image from 'next/image';

interface SilhouetteStatementSectionProps {
  imageUrl?: string;
}

const mobileTextConfig = {
  heading: {
    line1: 'Recognize the silhouette',
    line2: 'that reveals',
    line3: '"you"',
    fontSize: '24px',
  },
  body: [
    'The gear you rock is only as solid as the hustle behind it-and whose hands put in the work.',
    'To hit our vision without burning the bridge, ishtile only partners with the real ones. We link with makers who match our energy, hold the line on quality, and respect the earth as heavy as we do.',
    "Top-tier fits aren't just luck. They're born from solid people putting in the hours and doing it right.",
  ],
};

const desktopTextConfig = {
  heading: {
    line1: 'Recognize the silhouette',
    line2: 'that reveals',
    line3: '"you"',
    fontSize: '45px',
  },
  body: [
    'The gear you rock is only as solid as the hustle behind it-and whose hands put in the work.',
    'To hit our vision without burning the bridge, ishtile only partners with the real ones. We link with makers who match our energy, hold the line on quality, and respect the earth as heavy as we do.',
    "Top-tier fits aren't just luck. They're born from solid people putting in the hours and doing it right.",
  ],
};

export default function SilhouetteStatementSection({
  imageUrl = '/images/silhouette.png',
}: SilhouetteStatementSectionProps) {
  return (
    <section style={{ width: '100%', borderTop: '1px solid #1C1A19', borderBottom: '1px solid #1C1A19' }}>
      <div style={{ position: 'relative', width: '100%', height: 'clamp(300px, 58vw, 700px)', overflow: 'hidden' }}>
        <Image
          src={imageUrl}
          alt="Campaign silhouette"
          fill
          priority={false}
          sizes="100vw"
          style={{ objectFit: 'cover' }}
        />
      </div>

      <div
        style={{
          backgroundColor: '#232323',
          color: '#F8F4ED',
          padding: 'clamp(1.5rem, 4vw, 2.625rem) clamp(1rem, 5vw, 5.375rem) clamp(2rem, 6vw, 7.5rem)',
        }}
      >
        <div style={{ maxWidth: '1560px', margin: '0 auto' }}>
          <h3
            className="md:hidden"
            style={{
              margin: 0,
              fontFamily: '"Doppio One", sans-serif',
              fontWeight: 400,
              fontSize: mobileTextConfig.heading.fontSize,

              textTransform: 'uppercase',
              maxWidth: '100%',
            }}
          >
            <span className="block text-left">
              {mobileTextConfig.heading.line1}
            </span>
            <span className="block text-left">
              {mobileTextConfig.heading.line2}
            </span>
            <span className="block text-right py-3">
              {mobileTextConfig.heading.line3}
            </span>
          </h3>

          <h3
            className="hidden md:block"
            style={{
              margin: 0,
              fontFamily: '"Doppio One", sans-serif',
              fontWeight: 400,
              fontSize: desktopTextConfig.heading.fontSize,
              // lineHeight: '2px',
              textTransform: 'uppercase',
              maxWidth: '65%',
            }}
          >
            <span className="block text-left">
              {desktopTextConfig.heading.line1}
            </span>
            <span className="block text-left">
              {desktopTextConfig.heading.line2}
            </span>
            <span className="block text-right">
              {desktopTextConfig.heading.line3}
            </span>
          </h3>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'clamp(1.1rem, 3vw, 2.25rem)' }}>
            <div style={{ width: '100%', maxWidth: '33%', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p
                style={{
                  margin: 0,
                  fontFamily: '"Doppio One", sans-serif',
                  fontWeight: 400,
                  fontSize: '15px',
                  lineHeight: '23px',
                  letterSpacing: '0.09em',
                  color: '#F8F4ED',
                }}
              >
                {mobileTextConfig.body[0]}
              </p>

              <p
                style={{
                  margin: 0,
                  fontFamily: '"Doppio One", "Anton", sans-serif',
                  fontWeight: 400,
                  fontSize: '15px',
                  lineHeight: '23px',
                  letterSpacing: '0.09em',
                  color: '#F8F4ED',
                }}
              >
                {desktopTextConfig.body[1]}
              </p>

              <p
                style={{
                  margin: 0,
                  fontFamily: '"Doppio One", "Anton", sans-serif',
                  fontWeight: 400,
                  fontSize: '15px',
                  lineHeight: '23px',
                  letterSpacing: '0.09em',
                  color: '#F8F4ED',
                }}
              >
                {desktopTextConfig.body[2]}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
