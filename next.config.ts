import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    typedRoutes: false
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.rmz.gg',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
