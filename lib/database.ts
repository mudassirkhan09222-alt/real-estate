/**
 * SQLite database — single file, zero config, works on Node 24.
 * All tables are created on first run. No migrations needed for dev.
 */
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "warsi.db");

// Ensure data directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

let _db: Database.Database | null = null;

export function getDB(): Database.Database {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");
  _db.pragma("foreign_keys = ON");
  initSchema(_db);
  return _db;
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT    NOT NULL,
      email      TEXT    NOT NULL UNIQUE,
      password   TEXT    NOT NULL,
      role       TEXT    NOT NULL DEFAULT 'admin',
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS projects (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      title       TEXT    NOT NULL,
      slug        TEXT    NOT NULL UNIQUE,
      summary     TEXT    NOT NULL DEFAULT '',
      description TEXT    NOT NULL DEFAULT '',
      price       INTEGER NOT NULL DEFAULT 0,
      currency    TEXT    NOT NULL DEFAULT 'PKR',
      location    TEXT    NOT NULL DEFAULT '',
      city        TEXT    NOT NULL DEFAULT 'Karachi',
      type        TEXT    NOT NULL DEFAULT 'House',
      purpose     TEXT    NOT NULL DEFAULT 'sale',
      bedrooms    INTEGER NOT NULL DEFAULT 0,
      bathrooms   INTEGER NOT NULL DEFAULT 0,
      area_size   INTEGER NOT NULL DEFAULT 0,
      area_unit   TEXT    NOT NULL DEFAULT 'Marla',
      yield_pct   REAL    NOT NULL DEFAULT 0,
      featured    INTEGER NOT NULL DEFAULT 0,
      status      TEXT    NOT NULL DEFAULT 'available',
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS project_images (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      url         TEXT    NOT NULL,
      alt         TEXT    NOT NULL DEFAULT '',
      width       INTEGER NOT NULL DEFAULT 800,
      height      INTEGER NOT NULL DEFAULT 600,
      sort_order  INTEGER NOT NULL DEFAULT 0
    );
  `);
}

// ─── Type helpers ──────────────────────────────────────────────────────────

export interface DBProject {
  id: number;
  title: string;
  slug: string;
  summary: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  city: string;
  type: string;
  purpose: string;
  bedrooms: number;
  bathrooms: number;
  area_size: number;
  area_unit: string;
  yield_pct: number;
  featured: number; // 0 or 1 in SQLite
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DBProjectImage {
  id: number;
  project_id: number;
  url: string;
  alt: string;
  width: number;
  height: number;
  sort_order: number;
}

export interface DBUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  created_at: string;
}
