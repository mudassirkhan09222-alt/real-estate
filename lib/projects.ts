/**
 * Project repository — all CRUD operations for the Projects table.
 */
import { getDB, type DBProject, type DBProjectImage } from "./database";
import { slugify } from "./format";
import crypto from "crypto";

export interface ProjectImage {
  id: string;
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface Project {
  id: string;
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
  areaSqft: number;
  areaUnit: string;
  yieldPercent: number;
  featured: boolean;
  status: string;
  images: ProjectImage[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectInput {
  title: string;
  summary?: string;
  description?: string;
  price?: number;
  currency?: string;
  location?: string;
  city?: string;
  type?: string;
  purpose?: string;
  bedrooms?: number;
  bathrooms?: number;
  areaSqft?: number;
  areaUnit?: string;
  yieldPercent?: number;
  featured?: boolean;
  status?: string;
  images?: ProjectImage[];
}

export interface PaginatedProjects {
  items: Project[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ProjectQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  featured?: boolean;
  city?: string;
}

function rowToProject(row: DBProject, images: DBProjectImage[]): Project {
  return {
    id: String(row.id),
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    description: row.description,
    price: row.price,
    currency: row.currency,
    location: row.location,
    city: row.city,
    type: row.type,
    purpose: row.purpose,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    areaSqft: row.area_size,
    areaUnit: row.area_unit,
    yieldPercent: row.yield_pct,
    featured: row.featured === 1,
    status: row.status,
    images: images.map((img) => ({
      id: String(img.id),
      url: img.url,
      alt: img.alt,
      width: img.width,
      height: img.height,
    })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function uniqueSlug(base: string, excludeId?: number): string {
  const db = getDB();
  let slug = base || "project";
  let n = 1;
  while (true) {
    const existing = db
      .prepare("SELECT id FROM projects WHERE slug = ?")
      .get(slug) as { id: number } | undefined;
    if (!existing || existing.id === excludeId) return slug;
    slug = `${base}-${++n}`;
  }
}

export function getProjects(query: ProjectQuery = {}): PaginatedProjects {
  const db = getDB();
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, query.pageSize ?? 9));

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (query.search?.trim()) {
    conditions.push("(p.title LIKE ? OR p.location LIKE ? OR p.summary LIKE ?)");
    const s = `%${query.search.trim()}%`;
    params.push(s, s, s);
  }
  if (query.status && query.status !== "all") {
    conditions.push("p.status = ?");
    params.push(query.status);
  }
  if (query.featured) {
    conditions.push("p.featured = 1");
  }
  if (query.city && query.city !== "all") {
    conditions.push("p.city = ?");
    params.push(query.city);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const total = (
    db.prepare(`SELECT COUNT(*) as cnt FROM projects p ${where}`).get(...params) as {
      cnt: number;
    }
  ).cnt;

  const rows = db
    .prepare(
      `SELECT p.* FROM projects p ${where} ORDER BY p.featured DESC, p.created_at DESC LIMIT ? OFFSET ?`,
    )
    .all(...params, pageSize, (page - 1) * pageSize) as DBProject[];

  const items = rows.map((row) => {
    const images = db
      .prepare("SELECT * FROM project_images WHERE project_id = ? ORDER BY sort_order ASC")
      .all(row.id) as DBProjectImage[];
    return rowToProject(row, images);
  });

  return { items, total, page, pageSize, hasMore: page * pageSize < total };
}

export function getProject(idOrSlug: string): Project | null {
  const db = getDB();
  const byId = /^\d+$/.test(idOrSlug);
  const row = (
    byId
      ? db.prepare("SELECT * FROM projects WHERE id = ?").get(Number(idOrSlug))
      : db.prepare("SELECT * FROM projects WHERE slug = ?").get(idOrSlug)
  ) as DBProject | undefined;
  if (!row) return null;
  const images = db
    .prepare("SELECT * FROM project_images WHERE project_id = ? ORDER BY sort_order ASC")
    .all(row.id) as DBProjectImage[];
  return rowToProject(row, images);
}

export function createProject(input: ProjectInput): Project {
  const db = getDB();
  const base = slugify(input.title ?? "project");
  const slug = uniqueSlug(base);
  const now = new Date().toISOString();

  const result = db
    .prepare(
      `INSERT INTO projects
        (title,slug,summary,description,price,currency,location,city,type,purpose,
         bedrooms,bathrooms,area_size,area_unit,yield_pct,featured,status,created_at,updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    )
    .run(
      input.title ?? "",
      slug,
      input.summary ?? "",
      input.description ?? "",
      input.price ?? 0,
      input.currency ?? "PKR",
      input.location ?? "",
      input.city ?? "Karachi",
      input.type ?? "House",
      input.purpose ?? "sale",
      input.bedrooms ?? 0,
      input.bathrooms ?? 0,
      input.areaSqft ?? 0,
      input.areaUnit ?? "Marla",
      input.yieldPercent ?? 0,
      input.featured ? 1 : 0,
      input.status ?? "available",
      now,
      now,
    );

  const projectId = Number(result.lastInsertRowid);

  // Insert images
  if (input.images?.length) {
    const imgStmt = db.prepare(
      "INSERT INTO project_images (project_id,url,alt,width,height,sort_order) VALUES (?,?,?,?,?,?)",
    );
    input.images.forEach((img, i) => {
      imgStmt.run(projectId, img.url, img.alt ?? "", img.width ?? 800, img.height ?? 600, i);
    });
  }

  return getProject(String(projectId))!;
}

export function updateProject(id: string, input: ProjectInput): Project | null {
  const db = getDB();
  const existing = db.prepare("SELECT * FROM projects WHERE id = ?").get(Number(id)) as
    | DBProject
    | undefined;
  if (!existing) return null;

  const base = slugify(input.title ?? existing.title);
  const newSlug =
    input.title && input.title !== existing.title
      ? uniqueSlug(base, Number(id))
      : existing.slug;
  const now = new Date().toISOString();

  db.prepare(
    `UPDATE projects SET
      title=?,slug=?,summary=?,description=?,price=?,currency=?,location=?,city=?,type=?,purpose=?,
      bedrooms=?,bathrooms=?,area_size=?,area_unit=?,yield_pct=?,featured=?,status=?,updated_at=?
     WHERE id=?`,
  ).run(
    input.title ?? existing.title,
    newSlug,
    input.summary ?? existing.summary,
    input.description ?? existing.description,
    input.price ?? existing.price,
    input.currency ?? existing.currency,
    input.location ?? existing.location,
    input.city ?? existing.city,
    input.type ?? existing.type,
    input.purpose ?? existing.purpose,
    input.bedrooms ?? existing.bedrooms,
    input.bathrooms ?? existing.bathrooms,
    input.areaSqft ?? existing.area_size,
    input.areaUnit ?? existing.area_unit,
    input.yieldPercent ?? existing.yield_pct,
    input.featured !== undefined ? (input.featured ? 1 : 0) : existing.featured,
    input.status ?? existing.status,
    now,
    Number(id),
  );

  // Replace images if provided
  if (input.images !== undefined) {
    db.prepare("DELETE FROM project_images WHERE project_id = ?").run(Number(id));
    if (input.images.length) {
      const imgStmt = db.prepare(
        "INSERT INTO project_images (project_id,url,alt,width,height,sort_order) VALUES (?,?,?,?,?,?)",
      );
      input.images.forEach((img, i) => {
        imgStmt.run(Number(id), img.url, img.alt ?? "", img.width ?? 800, img.height ?? 600, i);
      });
    }
  }

  return getProject(id);
}

export function deleteProject(id: string): boolean {
  const db = getDB();
  const result = db.prepare("DELETE FROM projects WHERE id = ?").run(Number(id));
  return result.changes > 0;
}
