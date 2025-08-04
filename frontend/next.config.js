/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Enable static optimization where possible
  reactStrictMode: true,
  // Disable image optimization in dev (faster builds)
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; font-src 'self' data: https:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-eval' 'unsafe-inline' https:; img-src 'self' data: https:; connect-src 'self' https:;",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/:path*`,
      },
    ];
  },
}

module.exports = nextConfig 