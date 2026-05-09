/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@novabash/brand'],
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;
