import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

/**
 * Storage abstraction for media assets.
 *
 * The local adapter writes to `public/uploads/` so files are served directly by
 * Next.js in development. In production you swap in a remote adapter (Cloudflare
 * R2 or AWS S3) behind the same `StorageAdapter` interface — no UI or API code
 * changes, because every consumer calls `getStorage()` and reads/writes via keys.
 *
 * To enable R2/S3 in production:
 *   1. Install the SDK: `npm i @aws-sdk/client-s3`
 *   2. Set env: STORAGE_DRIVER=r2, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID,
 *      R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_PUBLIC_BASE_URL
 *   3. Implement `RemoteStorageAdapter` below (skeleton provided) and return it
 *      from `getStorage()` when STORAGE_DRIVER=r2.
 *   4. Point next/image `remotePatterns` at R2_PUBLIC_BASE_URL (already wired via
 *      NEXT_PUBLIC_CDN_HOSTNAME in next.config.ts).
 */

export interface PutResult {
  /** Public URL the browser can load (relative path locally, https URL remotely). */
  url: string;
  /** Storage key (path within the bucket / local uploads dir). */
  key: string;
  contentType: string;
}

export interface StorageAdapter {
  put(key: string, body: Buffer, contentType: string): Promise<PutResult>;
  delete(key: string): Promise<void>;
  /** Build the public URL for a stored key without uploading. */
  urlFor(key: string): string;
}

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const PUBLIC_PREFIX = "/uploads";

const LocalAdapter: StorageAdapter = {
  async put(key: string, body: Buffer, contentType: string): Promise<PutResult> {
    const dest = path.join(UPLOAD_DIR, key);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, body);
    return { url: `${PUBLIC_PREFIX}/${key}`, key, contentType };
  },
  async delete(key: string): Promise<void> {
    const dest = path.join(UPLOAD_DIR, key);
    await fs.rm(dest, { force: true });
  },
  urlFor(key: string): string {
    return `${PUBLIC_PREFIX}/${key}`;
  },
};

/**
 * R2 / S3 adapter skeleton. Not wired by default (the SDK isn't installed).
 * Drop this in when you move uploads to object storage + a CDN.
 *
 * import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
 *
 * const client = new S3Client({
 *   region: "auto",
 *   endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
 *   credentials: {
 *     accessKeyId: process.env.R2_ACCESS_KEY_ID!,
 *     secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
 *   },
 * });
 *
 * const RemoteAdapter: StorageAdapter = {
 *   async put(key, body, contentType) {
 *     await client.send(new PutObjectCommand({
 *       Bucket: process.env.R2_BUCKET, Key: key, Body: body, ContentType: contentType,
 *       CacheControl: "public, max-age=31536000, immutable",
 *     }));
 *     return { url: `${process.env.R2_PUBLIC_BASE_URL}/${key}`, key, contentType };
 *   },
 *   async delete(key) {
 *     await client.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key }));
 *   },
 *   urlFor(key) { return `${process.env.R2_PUBLIC_BASE_URL}/${key}`; },
 * };
 */

let cached: StorageAdapter | null = null;

export function getStorage(): StorageAdapter {
  if (cached) return cached;
  const driver = process.env.STORAGE_DRIVER?.toLowerCase();
  if (driver === "r2" || driver === "s3") {
    throw new Error(
      "Remote storage selected (STORAGE_DRIVER=" +
        driver +
        ") but the R2/S3 adapter is not configured yet. See lib/storage.ts.",
    );
  }
  cached = LocalAdapter;
  return cached;
}

/** Partitioned key so 100k+/yr uploads never crowd a single directory. */
export function buildAssetKey(ext: string, date = new Date()): string {
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const id = crypto.randomUUID();
  return `${yyyy}/${mm}/${id}.${ext}`;
}
