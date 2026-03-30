import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'villa-sadulur.my.id',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'be-sadulur.local',
        pathname: '/uploads/**',
      },
    ],
  },
}

export default nextConfig

