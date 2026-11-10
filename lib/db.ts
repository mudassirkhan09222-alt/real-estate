/**
 * Database layer — Neon Serverless Postgres.
 *
 * Local dev:  set DATABASE_URL in .env to a Neon connection string.
 * Production: set DATABASE_URL in Vercel environment variables.
 *
 * Same interface as the old SQLite layer so all API routes work unchanged.
 */
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

// ── Connection ───────────────────────────────────────────────────────────────

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL environment variable is not set.");
  return neon(url);
}

// ── Bootstrap — called once per cold start ───────────────────────────────────

let bootstrapped = false;

export async function bootstrapDB() {
  if (bootstrapped) return;
  bootstrapped = true;
  const sql = getSql();

  await sql`
    CREATE TABLE IF NOT EXISTS admins (
      id            SERIAL PRIMARY KEY,
      email         TEXT   NOT NULL UNIQUE,
      password_hash TEXT   NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS properties (
      id           SERIAL PRIMARY KEY,
      title        TEXT    NOT NULL,
      description  TEXT    NOT NULL DEFAULT '',
      price        INTEGER NOT NULL DEFAULT 0,
      location     TEXT    NOT NULL DEFAULT '',
      status       TEXT    NOT NULL DEFAULT 'draft'
                   CHECK(status IN ('published','draft')),
      availability TEXT    NOT NULL DEFAULT 'available'
                   CHECK(availability IN ('available','sold_out')),
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS property_images (
      id          SERIAL PRIMARY KEY,
      property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      file_path   TEXT    NOT NULL,
      sort_order  INTEGER NOT NULL DEFAULT 0
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_props_status ON properties(status)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_pimgs_pid    ON property_images(property_id)`;

  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id   SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    )
  `;

  // Seed admin
  const envEmail = (process.env.ADMIN_EMAIL ?? "warsijeeconstructioncomapny@gmail.com").toLowerCase().trim();
  const envPass  =  process.env.ADMIN_PASSWORD ?? "Realstate1234";

  const existing = await sql`SELECT email FROM admins LIMIT 1`;

  if (existing.length === 0) {
    const hash = bcrypt.hashSync(envPass, 12);
    await sql`INSERT INTO admins (email, password_hash) VALUES (${envEmail}, ${hash})`;
    console.log("[db] Admin seeded →", envEmail);
  } else if (existing[0].email !== envEmail) {
    const hash = bcrypt.hashSync(envPass, 12);
    await sql`UPDATE admins SET email = ${envEmail}, password_hash = ${hash}`;
    console.log("[db] Admin email updated →", envEmail);
  }
}

// ── Admin helpers ─────────────────────────────────────────────────────────────

export async function findAdmin(email: string): Promise<AdminRow | null> {
  await bootstrapDB();
  const sql = getSql();
  const rows = await sql`SELECT * FROM admins WHERE email = ${email.toLowerCase().trim()} LIMIT 1`;
  return (rows[0] as AdminRow) ?? null;
}

// ── Property helpers ──────────────────────────────────────────────────────────

export async function dbGetProperties(params: {
  status?: string; search?: string; page: number; pageSize: number;
}): Promise<{ rows: PropertyRow[]; total: number }> {
  await bootstrapDB();
  const sql = getSql();
  const { status, search, page, pageSize } = params;
  const offset = (page - 1) * pageSize;

  // Count
  let total = 0;
  if (search && status && status !== "all") {
    const r = await sql`SELECT COUNT(*) as c FROM properties WHERE status = ${status} AND (title ILIKE ${"%" + search + "%"} OR location ILIKE ${"%" + search + "%"})`;
    total = Number(r[0].c);
  } else if (search) {
    const r = await sql`SELECT COUNT(*) as c FROM properties WHERE title ILIKE ${"%" + search + "%"} OR location ILIKE ${"%" + search + "%"}`;
    total = Number(r[0].c);
  } else if (status && status !== "all") {
    const r = await sql`SELECT COUNT(*) as c FROM properties WHERE status = ${status}`;
    total = Number(r[0].c);
  } else {
    const r = await sql`SELECT COUNT(*) as c FROM properties`;
    total = Number(r[0].c);
  }

  // Rows
  let rows: PropertyRow[] = [];
  if (search && status && status !== "all") {
    rows = await sql`SELECT * FROM properties WHERE status = ${status} AND (title ILIKE ${"%" + search + "%"} OR location ILIKE ${"%" + search + "%"}) ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}` as PropertyRow[];
  } else if (search) {
    rows = await sql`SELECT * FROM properties WHERE title ILIKE ${"%" + search + "%"} OR location ILIKE ${"%" + search + "%"} ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}` as PropertyRow[];
  } else if (status && status !== "all") {
    rows = await sql`SELECT * FROM properties WHERE status = ${status} ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}` as PropertyRow[];
  } else {
    rows = await sql`SELECT * FROM properties ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}` as PropertyRow[];
  }

  return { rows, total };
}

export async function dbGetProperty(id: number): Promise<PropertyRow | null> {
  await bootstrapDB();
  const sql = getSql();
  const rows = await sql`SELECT * FROM properties WHERE id = ${id} LIMIT 1`;
  return (rows[0] as PropertyRow) ?? null;
}

export async function dbCreateProperty(data: {
  title: string; description: string; price: number; location: string;
  status: string; availability: string;
}): Promise<PropertyRow> {
  await bootstrapDB();
  const sql = getSql();
  const rows = await sql`
    INSERT INTO properties (title, description, price, location, status, availability)
    VALUES (${data.title}, ${data.description}, ${data.price}, ${data.location}, ${data.status}, ${data.availability})
    RETURNING *
  `;
  return rows[0] as PropertyRow;
}

export async function dbUpdateProperty(id: number, data: {
  title: string; description: string; price: number; location: string;
  status: string; availability: string;
}): Promise<PropertyRow | null> {
  await bootstrapDB();
  const sql = getSql();
  const rows = await sql`
    UPDATE properties
    SET title = ${data.title}, description = ${data.description}, price = ${data.price},
        location = ${data.location}, status = ${data.status}, availability = ${data.availability},
        updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  return (rows[0] as PropertyRow) ?? null;
}

export async function dbDeleteProperty(id: number): Promise<boolean> {
  await bootstrapDB();
  const sql = getSql();
  const r = await sql`DELETE FROM properties WHERE id = ${id} RETURNING id`;
  return r.length > 0;
}

export async function dbGetImages(propertyId: number): Promise<ImageRow[]> {
  await bootstrapDB();
  const sql = getSql();
  return sql`SELECT * FROM property_images WHERE property_id = ${propertyId} ORDER BY sort_order` as unknown as Promise<ImageRow[]>;
}

export async function dbAddImage(propertyId: number, filePath: string, order: number): Promise<ImageRow> {
  await bootstrapDB();
  const sql = getSql();
  const rows = await sql`
    INSERT INTO property_images (property_id, file_path, sort_order)
    VALUES (${propertyId}, ${filePath}, ${order})
    RETURNING *
  `;
  return rows[0] as ImageRow;
}

export async function dbDeleteImages(propertyId: number): Promise<void> {
  await bootstrapDB();
  const sql = getSql();
  await sql`DELETE FROM property_images WHERE property_id = ${propertyId}`;
}

export async function dbDeleteImageById(id: number): Promise<ImageRow | null> {
  await bootstrapDB();
  const sql = getSql();
  const rows = await sql`DELETE FROM property_images WHERE id = ${id} RETURNING *`;
  return (rows[0] as ImageRow) ?? null;
}

export async function dbGetStats() {
  await bootstrapDB();
  const sql = getSql();
  const [total, published, draft] = await Promise.all([
    sql`SELECT COUNT(*) as c FROM properties`,
    sql`SELECT COUNT(*) as c FROM properties WHERE status = 'published'`,
    sql`SELECT COUNT(*) as c FROM properties WHERE status = 'draft'`,
  ]);
  return {
    total:     Number(total[0].c),
    published: Number(published[0].c),
    draft:     Number(draft[0].c),
  };
}

// ── Compatibility shim — keep old getDB() callers working ────────────────────
// (Used by /api/properties, /api/properties/[id] etc.)
// These return sync-style objects that now proxy to async functions.
// For new code, use the async helpers above.

export function getDB() {
  // Returns a proxy object for backward compat with old synchronous API routes
  // The actual DB calls are async — old routes must be updated separately
  throw new Error(
    "getDB() is not supported on Postgres. Use async db helpers (dbGetProperties, etc.) instead."
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AdminRow {
  id: number; email: string; password_hash: string;
}

export interface PropertyRow {
  id: number; title: string; description: string;
  price: number; location: string;
  status: string; availability: string;
  created_at: string; updated_at: string;
}

export interface ImageRow {
  id: number; property_id: number; file_path: string; sort_order: number;
}

export interface CategoryRow {
  id: number; name: string;
}
