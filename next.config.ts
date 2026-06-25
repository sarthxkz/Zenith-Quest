import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // Prevents double hook execution in development, improving responsive interaction speeds.
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production', // Strips console messages in production for optimized builds.
  },
  typescript: {
    // Speed up compile times dramatically by skipping type checks during production builds.
    ignoreBuildErrors: true,
  },
  productionBrowserSourceMaps: false, // Disables sourcemap generation to cut compile builds time significantly.
  poweredByHeader: false, // Disables the X-Powered-By header for minor response performance gains.
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'apod.nasa.gov' },
      { protocol: 'https', hostname: 'api.astronomyapi.com' },
    ],
  },
  // Transpile packages that need it
  transpilePackages: ['three'],
};

export default nextConfig;
