import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

/**
 * NOTE: cacheComponents is DISABLED intentionally.
 * Payload CMS admin panel has partial incompatibility with Next.js cacheComponents mode.
 * The public marketing site works identically without it.
 */
const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  // cacheComponents and partialPrefetching intentionally omitted — incompatible with Payload admin panel
  images: {
    // AVIF preferred, WebP fallback
    formats: ["image/avif", "image/webp"],
    // Next 16 requires explicit qualities allowlist
    qualities: [40, 60, 75, 90],
    // Long-lived cache for optimized derivatives (31 days)
    minimumCacheTTL: 60 * 60 * 24 * 31,
    remotePatterns: [
      // Demo seed imagery from Unsplash
      { protocol: "https", hostname: "images.unsplash.com" },
      // Payload serves local uploads from the same origin — no remote pattern needed.
      // If you move media to a CDN later, add its hostname here.
      ...(process.env.NEXT_PUBLIC_CDN_HOSTNAME
        ? [{ protocol: "https" as const, hostname: process.env.NEXT_PUBLIC_CDN_HOSTNAME }]
        : []),
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withPayload(nextConfig);
