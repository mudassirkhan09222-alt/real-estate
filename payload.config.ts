import { buildConfig } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

import { Properties } from "./payload/collections/Properties";
import { Media } from "./payload/collections/Media";
import { Services } from "./payload/collections/Services";
import { Users } from "./payload/collections/Users";
import { Settings } from "./payload/collections/Settings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  // ── Admin panel ──────────────────────────────────────────────────
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: "— Warsi Real Estate Admin",
    },
  },

  // ── Collections ──────────────────────────────────────────────────
  collections: [Properties, Media, Services, Users],

  // ── Globals ──────────────────────────────────────────────────────
  globals: [Settings],

  // ── Rich text editor ─────────────────────────────────────────────
  editor: lexicalEditor({}),

  // ── Database — SQLite (local dev, no external DB needed) ──────────
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL ?? `file:${path.resolve(dirname, "warsi-realestate.db")}`,
    },
  }),

  // ── Sharp for image processing ───────────────────────────────────────
  sharp,

  // ── TypeScript output ────────────────────────────────────────────
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },

  // ── CORS / CSRF ──────────────────────────────────────────────────
  cors: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL ?? "http://localhost:3000",
  ],
  csrf: [
    process.env.PAYLOAD_PUBLIC_SERVER_URL ?? "http://localhost:3000",
  ],

  // ── Secret ───────────────────────────────────────────────────────
  secret: process.env.PAYLOAD_SECRET ?? "fallback-dev-secret-change-in-production",

  // ── Server URL ───────────────────────────────────────────────────
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL ?? "http://localhost:3000",
});
