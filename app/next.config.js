/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    outputFileTracingRoot: require('path').join(__dirname, '../'),
  },
  output: 'standalone',
}

module.exports = nextConfig
