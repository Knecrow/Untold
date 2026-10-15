import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Compression & clean headers
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  // Allow server actions to run up to 10s (covers cold DB connects)
  serverExternalPackages: ['@libsql/client'],
  experimental: {
    // Tree-shake and load only the icons used, reducing bundle size
    optimizePackageImports: ['lucide-react'],
  },
}

export default nextConfig
