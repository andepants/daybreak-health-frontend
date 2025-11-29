/**
 * Next.js configuration for Aptible deployment.
 * Uses standalone output for Docker containerization.
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
