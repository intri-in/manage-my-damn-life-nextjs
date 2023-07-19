/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    forceSwcTransforms: true,
  },
}

module.exports = nextConfig
