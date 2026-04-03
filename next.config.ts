import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Standalone output untuk deployment Node.js (Hostinger / VPS)
  // Build: npm run build
  // Start: node .next/standalone/server.js  (atau npm start)
  output: 'standalone',

  compress: true,
  poweredByHeader: false,

  images: {
    remotePatterns: [
      // Production — API subdomain
      {
        protocol: 'https',
        hostname: 'api.villa-sadulur.com',
        pathname: '/uploads/**',
      },
      // Legacy production (fallback)
      {
        protocol: 'https',
        hostname: 'villa-sadulur.my.id',
        pathname: '/uploads/**',
      },
      // Local development
      {
        protocol: 'http',
        hostname: 'be-sadulur.local',
        pathname: '/uploads/**',
      },
      // Localhost dev
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/uploads/**',
      },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        ],
      },
    ]
  },

  // Rewrite /api/* → API subdomain saat development local (opsional)
  async rewrites() {
    return []
  },
}

export default nextConfig

