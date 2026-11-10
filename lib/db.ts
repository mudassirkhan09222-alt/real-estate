/**
 * SQLite singleton — better-sqlite3 + WAL mode.
 * Tables created on first run. One admin seeded. No registration.
 */
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs";

// ✅ FIX: Vercel par /tmp folder use karein (writable), local par ./data use karein
const isVercel = !!process.env.VERCEL;
const DB_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "warsi.db");

// Ensure directory exists before creating database
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

let _db: Database.Database | null = null;

export function getDB(): Database.Database {
  if (_db) return _db;
  
  // Re-open connection if it was lost (e.g., after cold start on Vercel)
  try {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    createTables(_db);
    seedAdmin(_db);
  } catch (error) {
    console.error("[db] Failed to initialize database:", error);
    throw error;
  }
  
  return _db;
}

// ── Schema ──────────────────────────────────────────────────────────────────

function createTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         TEXT    NOT NULL UNIQUE,
      password_hash TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS properties (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      description TEXT    NOT NULL DEFAULT '',
      price       INTEGER NOT NULL DEFAULT 0,
      location    TEXT    NOT NULL DEFAULT '',
      status      TEXT    NOT NULL DEFAULT 'draft'
                  CHECK(status IN ('published','draft')),
      availability TEXT   NOT NULL DEFAULT 'available'
                  CHECK(availability IN ('available','sold_out')),
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS property_images (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
      file_path   TEXT    NOT NULL,
      sort_order  INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_props_status ON properties(status);
    CREATE INDEX IF NOT EXISTS idx_pimgs_pid    ON property_images(property_id);
  `);

  // Idempotent migration: add availability column if it doesn't exist yet
  try {
    db.exec(`ALTER TABLE properties ADD COLUMN availability TEXT NOT NULL DEFAULT 'available' CHECK(availability IN ('available','sold_out'))`);
  } catch {
    // Column already exists — safe to ignore
  }
}

// ── Seed ONE admin — never allow registration ────────────────────────────

function seedAdmin(db: Database.Database) {
  const envEmail = (process.env.ADMIN_EMAIL ?? "warsijeeconstructioncomapny@gmail.com").toLowerCase().trim();
  const envPass  = process.env.ADMIN_PASSWORD ?? "Realstate1234";

  const n = (db.prepare("SELECT COUNT(*) as n FROM admins").get() as { n: number }).n;

  if (n > 0) {
    // If email changed in .env, update the stored admin record
    const existing = db.prepare("SELECT email FROM admins LIMIT 1").get() as { email: string } | undefined;
    if (existing && existing.email !== envEmail) {
      const newHash = bcrypt.hashSync(envPass, 12);
      db.prepare("UPDATE admins SET email = ?, password_hash = ?").run(envEmail, newHash);
      console.log("[db] Admin email updated →", envEmail);
    }
    return;
  }

  const hash = bcrypt.hashSync(envPass, 12);
  db.prepare("INSERT INTO admins (email, password_hash) VALUES (?, ?)").run(envEmail, hash);
  console.log("[db] Admin seeded →", envEmail);
}

// ── Row types ────────────────────────────────────────────────────────────

export interface AdminRow {
  id: number; email: string; password_hash: string;
}

export interface PropertyRow {
  id: number; title: string; description: string;
  price: number; location: string;
  status: "published" | "draft";
  availability: "available" | "sold_out";
  created_at: string; updated_at: string;
}

export interface ImageRow {
  id: number; property_id: number; file_path: string; sort_order: number;
}

export interface CategoryRow {
  id: number; name: string;
}