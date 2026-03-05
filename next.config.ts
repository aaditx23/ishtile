import type { NextConfig } from 'next';

const securityHeaders = [
  // Block the site from being embedded in an iframe (clickjacking)
  { key: 'X-Frame-Options', value: 'DENY' },
  // Stop browsers from MIME-sniffing the content type
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Only send referrer on same-origin requests
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable FLoC / other tracking features
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  // Basic CSP — tightened once CDN / font domains are known
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // relax for Next.js HMR; tighten in prod
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'pand.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'ishtile-backend.onrender.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  async headers() {
    return [
      {
        // Apply to every route
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
