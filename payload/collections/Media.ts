import type { CollectionConfig } from "payload";

/**
 * Media collection — handles all image uploads.
 * Payload automatically processes WebP conversion and generates multiple sizes.
 * Images are stored in /public/media/ and served statically by Next.js.
 */
export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  upload: {
    staticDir: "public/media",
    imageSizes: [
      { name: "thumbnail", width: 400, height: 300, position: "centre" },
      { name: "card", width: 800, height: 600, position: "centre" },
      { name: "hero", width: 1600, height: 1067, position: "centre" },
    ],
    adminThumbnail: "thumbnail",
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    formatOptions: {
      format: "webp",
      options: { quality: 82 },
    },
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
      label: "Alt Text",
    },
  ],
};
