import type { NextConfig } from "next";
/** @type {NextConfig} */
const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000",
  },
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '8000' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8000' },
      { protocol: 'https', hostname: 'example.com' },
      { protocol: 'https', hostname: 'www.google.com' },
      { protocol: 'https', hostname: 'img.magnific.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: '*.vercel.app' },
      { protocol: 'https', hostname: 'imgur.com' },
    ],
  },
};

export default nextConfig;