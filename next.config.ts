/**
 * Next.js configuration for Aptible deployment.
 * Uses standalone output for Docker containerization.
 * Includes API proxy for local development to avoid CORS issues.
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  /**
   * Rewrites proxy GraphQL requests through Next.js to avoid CORS issues.
   * In development: /api/graphql -> localhost:3000/graphql
   * In production: Direct connection (same-origin on Aptible)
   */
  async rewrites() {
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      return [];
    }

    // Development: proxy through Next.js to avoid CORS
    const apiTarget = process.env.NEXT_PUBLIC_API_TARGET || 'local';
    const backendUrl = apiTarget === 'aptible'
      ? 'https://app-98507.on-aptible.com'
      : 'http://localhost:3000';

    return [
      {
        source: '/api/graphql',
        destination: `${backendUrl}/graphql`,
      },
    ];
  },
};

export default nextConfig;
