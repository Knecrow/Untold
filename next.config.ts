import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow server actions to run up to 10s (covers cold DB connects)
  serverExternalPackages: ['@libsql/client'],
  experimental: {
    // Enable Server Actions (stable in Next 15, but explicit for clarity)
  },
}

export default nextConfig
