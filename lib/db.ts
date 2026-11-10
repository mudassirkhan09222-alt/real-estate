/**
 * Database layer — dual mode:
 * • LOCAL / no DATABASE_URL  → better-sqlite3 (file-based, works offline)
 * • PRODUCTION / DATABASE_URL set → Neon Serverless Postgres
 *
 * This lets you develop locally without Neon and deploy to Vercel with Neon.
 */

import bcrypt from "bcryptjs";

// ── Detect mode ──────────────────────────────────────────────────────────────

const USE_POSTGRES = !!(process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("file:") && !process.env.DATABASE_URL.includes("placeholder"));

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AdminRow    { id: number; email: string; password_hash: string; }
export interface PropertyRow { id: number; title: string; description: string; price: number; location: string; status: string; availability: string; created_at: string; updated_at: string; }
export interface ImageRow    { id: number; property_id: number; file_path: string; sort_order: number; }
export interface CategoryRow { id: number; name: string; }

// ══════════════════════════════════════════════════════════════════════════════
//  SQLITE (local dev)
// ══════════════════════════════════════════════════════════════════════════════

function getSQLiteDB() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require("better-sqlite3");
  const path = require("path") as typeof import("path");
  const fs   = require("fs")   as typeof import("fs");
  const dir  = path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  const db = new Database(path.join(dir, "warsi.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  return db;
}

let _sqlite: ReturnType<typeof getSQLiteDB> | null = null;
function sqlite() {
  if (_sqlite) return _sqlite;
  _sqlite = getSQLiteDB();
  sqliteBootstrap(_sqlite);
  return _sqlite;
}

function sqliteBootstrap(db: ReturnType<typeof getSQLiteDB>) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price INTEGER NOT NULL DEFAULT 0,
      location TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft',
      availability TEXT NOT NULL DEFAULT 'available',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS property_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      file_path TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
    CREATE INDEX IF NOT EXISTS idx_props_status ON properties(status);
  `);
  try { db.exec(`ALTER TABLE properties ADD COLUMN availability TEXT NOT NULL DEFAULT 'available'`); } catch { /* already exists */ }

  const envEmail = (process.env.ADMIN_EMAIL ?? "warsijeeconstructioncompany@gmail.com").toLowerCase().trim();
  const envPass  =  process.env.ADMIN_PASSWORD ?? "Realstate1234";
  const count    = (db.prepare("SELECT COUNT(*) as n FROM admins").get() as { n: number }).n;
  if (count === 0) {
    db.prepare("INSERT INTO admins (email,password_hash) VALUES (?,?)").run(envEmail, bcrypt.hashSync(envPass, 12));
  } else {
    const ex = db.prepare("SELECT email FROM admins LIMIT 1").get() as { email: string };
    if (ex.email !== envEmail) db.prepare("UPDATE admins SET email=?,password_hash=?").run(envEmail, bcrypt.hashSync(envPass, 12));
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  POSTGRES (Neon — production)
// ══════════════════════════════════════════════════════════════════════════════

function pgSQL() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { neon } = require("@neondatabase/serverless");
  return neon(process.env.DATABASE_URL!);
}

let pgBootstrapped = false;
async function pgBootstrap() {
  if (pgBootstrapped) return;
  pgBootstrapped = true;
  const sql = pgSQL();
  await sql`CREATE TABLE IF NOT EXISTS admins (id SERIAL PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL)`;
  await sql`CREATE TABLE IF NOT EXISTS properties (id SERIAL PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', price INTEGER NOT NULL DEFAULT 0, location TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'draft', availability TEXT NOT NULL DEFAULT 'available', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
  await sql`CREATE TABLE IF NOT EXISTS property_images (id SERIAL PRIMARY KEY, property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE, file_path TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0)`;
  await sql`CREATE TABLE IF NOT EXISTS categories (id SERIAL PRIMARY KEY, name TEXT NOT NULL UNIQUE)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_props_status ON properties(status)`;

  const envEmail = (process.env.ADMIN_EMAIL ?? "warsijeeconstructioncompany@gmail.com").toLowerCase().trim();
  const envPass  =  process.env.ADMIN_PASSWORD ?? "Realstate1234";
  const rows = await sql`SELECT email FROM admins LIMIT 1`;
  if (rows.length === 0) {
    await sql`INSERT INTO admins (email,password_hash) VALUES (${envEmail},${bcrypt.hashSync(envPass,12)})`;
  } else {
    // Always sync email AND password from env on every bootstrap
    await sql`UPDATE admins SET email=${envEmail},password_hash=${bcrypt.hashSync(envPass,12)}`;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
//  UNIFIED PUBLIC API
// ══════════════════════════════════════════════════════════════════════════════

export async function bootstrapDB() {
  if (USE_POSTGRES) await pgBootstrap();
  else sqlite(); // boots + seeds synchronously
}

export async function findAdmin(email: string): Promise<AdminRow | null> {
  const e = email.toLowerCase().trim();
  if (USE_POSTGRES) {
    await pgBootstrap();
    const rows = await pgSQL()`SELECT * FROM admins WHERE email=${e} LIMIT 1`;
    return (rows[0] as AdminRow) ?? null;
  }
  return sqlite().prepare("SELECT * FROM admins WHERE email=?").get(e) as AdminRow ?? null;
}

// ── Properties ───────────────────────────────────────────────────────────────

export async function dbGetProperties(p: { status?: string; search?: string; page: number; pageSize: number }) {
  const { status, search, page, pageSize } = p;
  const offset = (page - 1) * pageSize;

  if (USE_POSTGRES) {
    await pgBootstrap();
    const sql = pgSQL();
    const st  = status && status !== "all" ? status : null;
    let total = 0; let rows: PropertyRow[] = [];

    if (st && search) {
      total = Number((await sql`SELECT COUNT(*) as c FROM properties WHERE status=${st} AND (title ILIKE ${"%" + search + "%"} OR location ILIKE ${"%" + search + "%"})`)[0].c);
      rows  = await sql`SELECT * FROM properties WHERE status=${st} AND (title ILIKE ${"%" + search + "%"} OR location ILIKE ${"%" + search + "%"}) ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}` as PropertyRow[];
    } else if (st) {
      total = Number((await sql`SELECT COUNT(*) as c FROM properties WHERE status=${st}`)[0].c);
      rows  = await sql`SELECT * FROM properties WHERE status=${st} ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}` as PropertyRow[];
    } else if (search) {
      total = Number((await sql`SELECT COUNT(*) as c FROM properties WHERE title ILIKE ${"%" + search + "%"} OR location ILIKE ${"%" + search + "%"}`)[0].c);
      rows  = await sql`SELECT * FROM properties WHERE title ILIKE ${"%" + search + "%"} OR location ILIKE ${"%" + search + "%"} ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}` as PropertyRow[];
    } else {
      total = Number((await sql`SELECT COUNT(*) as c FROM properties`)[0].c);
      rows  = await sql`SELECT * FROM properties ORDER BY created_at DESC LIMIT ${pageSize} OFFSET ${offset}` as PropertyRow[];
    }
    return { rows, total };
  }

  // SQLite
  const db = sqlite();
  const conds: string[] = []; const params: (string|number)[] = [];
  if (status && status !== "all") { conds.push("status=?"); params.push(status); }
  if (search) { conds.push("(title LIKE ? OR location LIKE ?)"); params.push(`%${search}%`,`%${search}%`); }
  const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";
  const total = (db.prepare(`SELECT COUNT(*) as c FROM properties ${where}`).get(...params) as { c: number }).c;
  const rows  = db.prepare(`SELECT * FROM properties ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params, pageSize, offset) as PropertyRow[];
  return { rows, total };
}

export async function dbGetProperty(id: number): Promise<PropertyRow | null> {
  if (USE_POSTGRES) {
    await pgBootstrap();
    const rows = await pgSQL()`SELECT * FROM properties WHERE id=${id} LIMIT 1`;
    return (rows[0] as PropertyRow) ?? null;
  }
  return sqlite().prepare("SELECT * FROM properties WHERE id=?").get(id) as PropertyRow ?? null;
}

export async function dbCreateProperty(d: { title:string; description:string; price:number; location:string; status:string; availability:string }): Promise<PropertyRow> {
  if (USE_POSTGRES) {
    await pgBootstrap();
    const rows = await pgSQL()`INSERT INTO properties (title,description,price,location,status,availability) VALUES (${d.title},${d.description},${d.price},${d.location},${d.status},${d.availability}) RETURNING *`;
    return rows[0] as PropertyRow;
  }
  const db = sqlite();
  const r  = db.prepare("INSERT INTO properties (title,description,price,location,status,availability) VALUES (?,?,?,?,?,?)").run(d.title,d.description,d.price,d.location,d.status,d.availability);
  return db.prepare("SELECT * FROM properties WHERE id=?").get(r.lastInsertRowid) as PropertyRow;
}

export async function dbUpdateProperty(id:number, d: { title:string; description:string; price:number; location:string; status:string; availability:string }): Promise<PropertyRow | null> {
  if (USE_POSTGRES) {
    await pgBootstrap();
    const rows = await pgSQL()`UPDATE properties SET title=${d.title},description=${d.description},price=${d.price},location=${d.location},status=${d.status},availability=${d.availability},updated_at=NOW() WHERE id=${id} RETURNING *`;
    return (rows[0] as PropertyRow) ?? null;
  }
  const db = sqlite();
  db.prepare("UPDATE properties SET title=?,description=?,price=?,location=?,status=?,availability=?,updated_at=datetime('now') WHERE id=?").run(d.title,d.description,d.price,d.location,d.status,d.availability,id);
  return db.prepare("SELECT * FROM properties WHERE id=?").get(id) as PropertyRow ?? null;
}

export async function dbDeleteProperty(id:number): Promise<boolean> {
  if (USE_POSTGRES) {
    await pgBootstrap();
    const r = await pgSQL()`DELETE FROM properties WHERE id=${id} RETURNING id`;
    return r.length > 0;
  }
  return sqlite().prepare("DELETE FROM properties WHERE id=?").run(id).changes > 0;
}

// ── Images ───────────────────────────────────────────────────────────────────

export async function dbGetImages(propertyId:number): Promise<ImageRow[]> {
  if (USE_POSTGRES) {
    await pgBootstrap();
    return await pgSQL()`SELECT * FROM property_images WHERE property_id=${propertyId} ORDER BY sort_order` as ImageRow[];
  }
  return sqlite().prepare("SELECT * FROM property_images WHERE property_id=? ORDER BY sort_order").all(propertyId) as ImageRow[];
}

export async function dbAddImage(propertyId:number, filePath:string, order:number): Promise<ImageRow> {
  if (USE_POSTGRES) {
    await pgBootstrap();
    const r = await pgSQL()`INSERT INTO property_images (property_id,file_path,sort_order) VALUES (${propertyId},${filePath},${order}) RETURNING *`;
    return r[0] as ImageRow;
  }
  const db = sqlite();
  const r  = db.prepare("INSERT INTO property_images (property_id,file_path,sort_order) VALUES (?,?,?)").run(propertyId,filePath,order);
  return db.prepare("SELECT * FROM property_images WHERE id=?").get(r.lastInsertRowid) as ImageRow;
}

export async function dbDeleteImages(propertyId:number): Promise<void> {
  if (USE_POSTGRES) { await pgBootstrap(); await pgSQL()`DELETE FROM property_images WHERE property_id=${propertyId}`; return; }
  sqlite().prepare("DELETE FROM property_images WHERE property_id=?").run(propertyId);
}

export async function dbDeleteImageById(id:number): Promise<ImageRow | null> {
  if (USE_POSTGRES) {
    await pgBootstrap();
    const r = await pgSQL()`DELETE FROM property_images WHERE id=${id} RETURNING *`;
    return (r[0] as ImageRow) ?? null;
  }
  const db  = sqlite();
  const img = db.prepare("SELECT * FROM property_images WHERE id=?").get(id) as ImageRow ?? null;
  if (img) db.prepare("DELETE FROM property_images WHERE id=?").run(id);
  return img;
}

// ── Stats ────────────────────────────────────────────────────────────────────

export async function dbGetStats() {
  if (USE_POSTGRES) {
    await pgBootstrap();
    const sql = pgSQL();
    const [a,b,c] = await Promise.all([
      sql`SELECT COUNT(*) as c FROM properties`,
      sql`SELECT COUNT(*) as c FROM properties WHERE status='published'`,
      sql`SELECT COUNT(*) as c FROM properties WHERE status='draft'`,
    ]);
    return { total:Number(a[0].c), published:Number(b[0].c), draft:Number(c[0].c) };
  }
  const db = sqlite();
  return {
    total:     (db.prepare("SELECT COUNT(*) as c FROM properties").get() as {c:number}).c,
    published: (db.prepare("SELECT COUNT(*) as c FROM properties WHERE status='published'").get() as {c:number}).c,
    draft:     (db.prepare("SELECT COUNT(*) as c FROM properties WHERE status='draft'").get() as {c:number}).c,
  };
}

// ── Legacy shim ───────────────────────────────────────────────────────────────
export function getDB() { return sqlite(); }
