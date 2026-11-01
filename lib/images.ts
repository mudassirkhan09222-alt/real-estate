import sharp from "sharp";
import { getStorage, buildAssetKey } from "./storage";

/**
 * Upload-time image optimization pipeline.
 *
 * On upload we produce ONE optimized master (WebP, capped width, EXIF-rotated)
 * plus a tiny base64 blur placeholder. next/image then generates responsive
 * srcset widths and serves AVIF/WebP on demand from that master, caching the
 * derivatives for `minimumCacheTTL` (see next.config.ts).
 *
 * This two-stage strategy keeps storage bounded (1 master per upload) while
 * still delivering AVIF + responsive sizes, and front-loads the expensive
 * resize/encode once at upload time rather than on first request.
 */

export interface OptimizedImage {
  url: string;
  key: string;
  width: number;
  height: number;
  blurDataURL: string;
  contentType: string;
}

const DEFAULT_MAX_WIDTH = 1600;
const DEFAULT_QUALITY = 82;
const BLUR_WIDTH = 8;

export interface OptimizeOptions {
  maxWidth?: number;
  quality?: number;
}

export async function optimizeAndStore(
  buffer: Buffer,
  opts: OptimizeOptions = {},
): Promise<OptimizedImage> {
  const maxWidth = opts.maxWidth ?? DEFAULT_MAX_WIDTH;
  const quality = opts.quality ?? DEFAULT_QUALITY;

  // Master derivative — resize down only (never upscale), normalize orientation.
  const masterBuffer = await sharp(buffer, { failOn: "none" })
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();

  const masterMeta = await sharp(masterBuffer).metadata();
  const width = masterMeta.width ?? maxWidth;
  const height = masterMeta.height ?? Math.round((width * 2) / 3);

  // Blur placeholder — 8px wide, low-quality, inlined as a data URL.
  const blurBuffer = await sharp(buffer, { failOn: "none" })
    .resize({ width: BLUR_WIDTH, withoutEnlargement: true })
    .webp({ quality: 30 })
    .toBuffer();
  const blurDataURL = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

  const key = buildAssetKey("webp");
  const stored = await getStorage().put(key, masterBuffer, "image/webp");

  return {
    url: stored.url,
    key: stored.key,
    width,
    height,
    blurDataURL,
    contentType: stored.contentType,
  };
}

/**
 * Derive a blur data URL for an already-stored local asset (used when seeding
 * or importing existing images without re-uploading). Best-effort: returns
 * undefined if the file can't be read.
 */
export async function blurFromLocalPath(publicPath: string): Promise<string | undefined> {
  try {
    if (!publicPath.startsWith("/uploads/")) return undefined;
    const abs = publicPath.replace(/^\/uploads\//, "");
    const { promises: fs } = await import("fs");
    const path = await import("path");
    const file = path.join(process.cwd(), "public", "uploads", abs);
    const buf = await fs.readFile(file);
    const blur = await sharp(buf, { failOn: "none" })
      .resize({ width: BLUR_WIDTH, withoutEnlargement: true })
      .webp({ quality: 30 })
      .toBuffer();
    return `data:image/webp;base64,${blur.toString("base64")}`;
  } catch {
    return undefined;
  }
}
