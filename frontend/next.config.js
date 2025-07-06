/** @type {import('next').NextConfig} */
const nextConfig = {
  // Typescript config is handled by tsconfig.json, not here
  experimental: {
    // Remove deprecated options (appDir and serverComponents are now stable)
    typedRoutes: true,
  },
  transpilePackages: ['@tanstack/react-query'],
  images: {
    domains: ['localhost', '127.0.0.1'],
    unoptimized: process.env.NODE_ENV === 'development',
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  // Enable output for Docker
  output: 'standalone',

  webpack: (config, { isServer }) => {
    // Handle TanStack Query bundling issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config
  },
}

module.exports = nextConfig
