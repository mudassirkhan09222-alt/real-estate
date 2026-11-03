import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { getDB, type PropertyRow, type ImageRow } from "@/lib/db";
import { saveImage } from "@/lib/upload";

const NS = { "Cache-Control": "no-store" };

/** GET — paginated list with images */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page") ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(sp.get("pageSize") ?? 12)));
  const status = sp.get("status");
  const search = sp.get("search")?.trim();
  const db = getDB();

  const conds: string[] = [];
  const params: (string | number)[] = [];
  if (status && status !== "all") { conds.push("p.status = ?"); params.push(status); }
  if (search) { conds.push("(p.title LIKE ? OR p.location LIKE ?)"); params.push(`%${search}%`, `%${search}%`); }
  const where = conds.length ? `WHERE ${conds.join(" AND ")}` : "";

  const total = (db.prepare(`SELECT COUNT(*) as c FROM properties p ${where}`).get(...params) as { c: number }).c;
  const rows = db.prepare(`SELECT p.* FROM properties p ${where} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`).all(...params, pageSize, (page - 1) * pageSize) as PropertyRow[];

  const items = rows.map(row => {
    const imgs = db.prepare("SELECT * FROM property_images WHERE property_id = ? ORDER BY sort_order").all(row.id) as ImageRow[];
    return { ...row, images: imgs.map(i => ({ id: i.id, filePath: i.file_path })) };
  });

  return NextResponse.json({ items, total, page, pageSize, hasMore: page * pageSize < total }, { headers: NS });
}

/** POST — create via FormData (title, description, price, location, status, images[]) */
export async function POST(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NS });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Expected multipart" }, { status: 400, headers: NS });

  const title = String(form.get("title") ?? "").trim();
  if (!title) return NextResponse.json({ error: "title required" }, { status: 422, headers: NS });

  const description = String(form.get("description") ?? "");
  const price = Number(form.get("price") ?? 0);
  const location = String(form.get("location") ?? "");
  const status = form.get("status") === "published" ? "published" : "draft";
  const now = new Date().toISOString();

  const db = getDB();

  // Slug uniqueness — reuse slugify from format
  function slug(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "property"; }
  let base = slug(title); let sl = base; let n = 1;
  while (db.prepare("SELECT id FROM properties WHERE title = ?").get(sl)) sl = `${base}-${++n}`;

  const r = db.prepare(`INSERT INTO properties (title,description,price,location,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?)`).run(title, description, price, location, status, now, now);
  const pid = Number(r.lastInsertRowid);

  const files = form.getAll("images").filter((f): f is File => f instanceof File);
  let order = 0;
  for (const file of files) {
    if (!file.type.startsWith("image/") || file.size > 25 * 1024 * 1024) continue;
    const buf = Buffer.from(await file.arrayBuffer());
    const fp = await saveImage(buf);
    db.prepare("INSERT INTO property_images (property_id,file_path,sort_order) VALUES (?,?,?)").run(pid, fp, order++);
  }

  const property = db.prepare("SELECT * FROM properties WHERE id = ?").get(pid) as PropertyRow;
  const imgs = db.prepare("SELECT * FROM property_images WHERE property_id = ?").all(pid) as ImageRow[];
  return NextResponse.json({ ...property, images: imgs.map(i => ({ id: i.id, filePath: i.file_path })) }, { status: 201, headers: NS });
}
