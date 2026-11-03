import sharp from "sharp";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/** Resize ≤1920px, WebP quality 80, save to /public/uploads/. Returns relative URL. */
export async function saveImage(buffer: Buffer): Promise<string> {
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const dest = path.join(UPLOAD_DIR, name);
  await sharp(buffer, { failOn: "none" })
    .rotate()
    .resize({ width: 1920, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(dest);
  return `/uploads/${name}`;
}

/** Safely delete an uploaded file. */
export function deleteImage(filePath: string): void {
  if (!filePath.startsWith("/uploads/")) return;
  const abs = path.join(process.cwd(), "public", filePath);
  fs.rmSync(abs, { force: true });
}
