/**
 * Next.js configuration for static export deployment.
 * Configured for S3/CloudFront hosting per architecture requirements.
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
