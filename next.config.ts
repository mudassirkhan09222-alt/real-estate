import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: { agentFeedback: true },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [40, 60, 75, 90],
    minimumCacheTTL: 60 * 60 * 24 * 31,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Product photos uploaded through the admin (lib/upload.ts → Vercel Blob).
      // Without this, /_next/image rejects them with 400 and every photo shows broken.
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/**", search: "" },
      ...(process.env.NEXT_PUBLIC_CDN_HOSTNAME
        ? [{ protocol: "https" as const, hostname: process.env.NEXT_PUBLIC_CDN_HOSTNAME }]
        : []),
    ],
  },
  turbopack: {
    rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } },
  },
};

export default nextConfig;
