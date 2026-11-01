import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type {
  PaginatedResult,
  Property,
  PropertyInput,
  PropertyQuery,
} from "./types";
import { slugify } from "./format";
import { SEED_PROPERTIES } from "./seed";

/**
 * Property repository.
 *
 * Default implementation persists to a single JSON file (`data/properties.json`).
 * This is deliberately simple and dependency-free so the demo runs anywhere,
 * but the surface below is the only thing the rest of the app depends on.
 * To move to PostgreSQL/MongoDB, re-implement these functions against your ORM
 * and keep the signatures identical — no UI, API, or component changes needed.
 */

const DATA_FILE = path.join(process.cwd(), "data", "properties.json");

/** Serializes writes within this process to avoid read-modify-write races. */
let writeChain: Promise<unknown> = Promise.resolve();

async function readAll(): Promise<Property[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Property[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(list: Property[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2), "utf8");
}

async function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const previous = writeChain;
  let release!: () => void;
  writeChain = new Promise<void>((resolve) => (release = resolve));
  await previous;
  try {
    return await fn();
  } finally {
    release();
  }
}

/** Idempotently seed the store on first access. */
export async function ensureSeeded(): Promise<void> {
  await withLock(async () => {
    const list = await readAll();
    if (list.length === 0) await writeAll(SEED_PROPERTIES);
  });
}

function matches(p: Property, q: PropertyQuery): boolean {
  if (q.region && q.region !== "all" && p.region !== q.region) return false;
  if (q.type && q.type !== "all" && p.type !== q.type) return false;
  if (q.status && q.status !== "all" && p.status !== q.status) return false;
  if (q.featured && !p.featured) return false;
  if (q.search) {
    const needle = q.search.toLowerCase();
    const haystack = `${p.title} ${p.location} ${p.summary} ${p.region}`.toLowerCase();
    if (!haystack.includes(needle)) return false;
  }
  return true;
}

export async function getProperties(query: PropertyQuery = {}): Promise<PaginatedResult<Property>> {
  await ensureSeeded();
  const list = await readAll();
  const filtered = list.filter((p) => matches(p, query));

  // Featured-first, then newest — stable, predictable ordering.
  filtered.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return b.createdAt.localeCompare(a.createdAt);
  });

  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, query.pageSize ?? 9));
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);

  return {
    items,
    page,
    pageSize,
    total,
    hasMore: start + pageSize < total,
  };
}

export async function getProperty(idOrSlug: string): Promise<Property | null> {
  await ensureSeeded();
  const list = await readAll();
  return list.find((p) => p.id === idOrSlug || p.slug === idOrSlug) ?? null;
}

export async function listAllSlugs(): Promise<{ id: string; slug: string }[]> {
  await ensureSeeded();
  const list = await readAll();
  return list.map((p) => ({ id: p.id, slug: p.slug }));
}

export async function countProperties(): Promise<number> {
  await ensureSeeded();
  return (await readAll()).length;
}

function uniqueSlug(list: Property[], title: string, ignoreId?: string): string {
  const base = slugify(title) || "property";
  let slug = base;
  let n = 2;
  while (list.some((p) => p.slug === slug && p.id !== ignoreId)) {
    slug = `${base}-${n++}`;
  }
  return slug;
}

export async function createProperty(input: PropertyInput): Promise<Property> {
  return withLock(async () => {
    const list = await readAll();
    const now = new Date().toISOString();
    const property: Property = {
      ...input,
      id: crypto.randomUUID(),
      slug: uniqueSlug(list, input.title),
      createdAt: now,
      updatedAt: now,
    };
    list.push(property);
    await writeAll(list);
    return property;
  });
}

export async function updateProperty(
  id: string,
  input: PropertyInput,
): Promise<Property | null> {
  return withLock(async () => {
    const list = await readAll();
    const idx = list.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const existing = list[idx];
    const updated: Property = {
      ...input,
      id: existing.id,
      slug: input.title !== existing.title ? uniqueSlug(list, input.title, id) : existing.slug,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    list[idx] = updated;
    await writeAll(list);
    return updated;
  });
}

export async function deleteProperty(id: string): Promise<boolean> {
  return withLock(async () => {
    const list = await readAll();
    const next = list.filter((p) => p.id !== id);
    if (next.length === list.length) return false;
    await writeAll(next);
    return true;
  });
}
