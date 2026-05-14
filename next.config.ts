import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    formats: ['image/webp'],
  },
  async redirects() {
    return [
      {
        source: '/archive.html',
        destination: '/archive',
        permanent: true,
      },
      {
        source: '/topology.html',
        destination: '/lab',
        permanent: true,
      },
      {
        source: '/curator.html',
        destination: '/literary/curator.html',
        permanent: true,
      },
      {
        source: '/reader.html',
        has: [{ type: 'query', key: 'id', value: '(?<id>.*)' }],
        destination: '/poem/:id',
        permanent: true,
      },
      {
        source: '/reader.html',
        destination: '/archive',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
