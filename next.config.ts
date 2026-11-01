import type { NextConfig } from "next";

/**
 * Production CDN hostnames for optimized image delivery.
 * Set in .env (e.g. NEXT_PUBLIC_CDN_HOSTNAME=images.example.com) to allow
 * next/image to optimize/serve assets served from Cloudflare Images / R2 / S3.
 */
const cdnHostname = process.env.NEXT_PUBLIC_CDN_HOSTNAME?.trim();

type RemotePattern = NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]>[number];

const remotePatterns: RemotePattern[] = [
  // Seed/sample imagery (Unsplash) — used only for demo listings.
  { protocol: "https", hostname: "images.unsplash.com" },
];

if (cdnHostname) {
  const host = cdnHostname.startsWith("http") ? new URL(cdnHostname).hostname : cdnHostname;
  remotePatterns.push({ protocol: "https", hostname: host });
  // Also allow any subdomain of the configured CDN (e.g. a CDN custom domain).
  remotePatterns.push({ protocol: "https", hostname: `**.${host}` });
}

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // AVIF preferred with WebP fallback. Both cached separately by next/image.
    formats: ["image/avif", "image/webp"],
    // Next.js 16 requires an explicit qualities allowlist.
    qualities: [40, 60, 75, 90],
    // Keep optimized derivatives on disk for a long time (31 days).
    minimumCacheTTL: 60 * 60 * 24 * 31,
    remotePatterns,
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

export default nextConfig;
