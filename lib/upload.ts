import sharp from "sharp";
import { put, del } from "@vercel/blob";

/**
 * Local development without a Blob token: save uploads to public/uploads/
 * instead, so the admin can be used and tested offline. On Vercel the token
 * is always set (and the filesystem is read-only), so this never runs there.
 */
const USE_LOCAL_DISK = !process.env.BLOB_READ_WRITE_TOKEN && !process.env.VERCEL;

/**
 * Resize ≤1920px, convert to WebP quality 80, upload to Vercel Blob.
 * Returns the public Blob URL (or a /uploads/... path in local development).
 */
export async function saveImage(buffer: Buffer): Promise<string> {
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

  const webpBuffer = await sharp(buffer, { failOn: "none" })
    .rotate()
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();

  if (USE_LOCAL_DISK) return saveToLocalDisk(name, webpBuffer);

  const blob = await put(`uploads/${name}`, webpBuffer, {
    access: "public",
    contentType: "image/webp",
  });

  return blob.url;
}

/**
 * Delete an image from Vercel Blob by its URL.
 * Accepts both full Blob URLs (https://...) and local paths (/uploads/...).
 * Local paths are only removed in local development; on Vercel they are
 * legacy files from the old filesystem and are ignored.
 */
export async function deleteImage(filePath: string): Promise<void> {
  if (filePath.startsWith("https://")) {
    await del(filePath);
  } else if (USE_LOCAL_DISK && filePath.startsWith("/uploads/") && !filePath.includes("..")) {
    const fs = await import("fs/promises");
    const path = await import("path");
    await fs.rm(path.join(process.cwd(), "public", filePath), { force: true });
  }
}

async function saveToLocalDisk(name: string, data: Buffer): Promise<string> {
  const fs = await import("fs/promises");
  const path = await import("path");
  const now = new Date();
  const dir = `uploads/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  await fs.mkdir(path.join(process.cwd(), "public", dir), { recursive: true });
  await fs.writeFile(path.join(process.cwd(), "public", dir, name), data);
  return `/${dir}/${name}`;
}
