/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    agentUpgrade: 'security',
  },
  output: 'export',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
