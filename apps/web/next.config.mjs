/** @type {import('next').NextConfig} */
const nextConfig = {
  // Local-first: the whole app is static and client-rendered. No server runtime,
  // so it deploys to any static host (Cloudflare Pages).
  output: 'export',
  reactStrictMode: true,
  transpilePackages: ['@novabash/brand'],
  images: { unoptimized: true },
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
