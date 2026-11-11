import sharp from "sharp";
import { put, del } from "@vercel/blob";

/**
 * Resize ≤1920px, convert to WebP quality 80, upload to Vercel Blob.
 * Returns the public Blob URL.
 */
export async function saveImage(buffer: Buffer): Promise<string> {
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

  const webpBuffer = await sharp(buffer, { failOn: "none" })
    .rotate()
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  const blob = await put(`uploads/${name}`, webpBuffer, {
    access: "public",
    contentType: "image/webp",
  });

  return blob.url;
}

/**
 * Delete an image from Vercel Blob by its URL.
 * Accepts both full Blob URLs (https://...) and legacy local paths (/uploads/...).
 * Legacy local paths are ignored gracefully since they no longer exist in Blob storage.
 */
export async function deleteImage(filePath: string): Promise<void> {
  if (filePath.startsWith("https://")) {
    await del(filePath);
  }
  // Legacy local paths (/uploads/...) are silently ignored —
  // those files live on the old filesystem and are no longer managed here.
}
