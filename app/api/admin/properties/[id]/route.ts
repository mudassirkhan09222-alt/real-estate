import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { getDB, type PropertyRow, type ImageRow } from "@/lib/db";
import { saveImage, deleteImage } from "@/lib/upload";

const NS = { "Cache-Control": "no-store" };

/** GET single property */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDB();
  const row = db.prepare("SELECT * FROM properties WHERE id = ?").get(Number(id)) as PropertyRow | undefined;
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404, headers: NS });
  const imgs = db.prepare("SELECT * FROM property_images WHERE property_id = ? ORDER BY sort_order").all(row.id) as ImageRow[];
  return NextResponse.json({ ...row, images: imgs.map(i => ({ id: i.id, filePath: i.file_path })) }, { headers: NS });
}

/** PUT — update via FormData */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NS });
  const { id } = await params;
  const db = getDB();
  const ex = db.prepare("SELECT * FROM properties WHERE id = ?").get(Number(id)) as PropertyRow | undefined;
  if (!ex) return NextResponse.json({ error: "Not found" }, { status: 404, headers: NS });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Expected multipart" }, { status: 400, headers: NS });

  const title = String(form.get("title") ?? ex.title).trim();
  const description = String(form.get("description") ?? ex.description);
  const price = Number(form.get("price") ?? ex.price);
  const location = String(form.get("location") ?? ex.location);
  const status = form.get("status") === "published" ? "published" : "draft";
  const now = new Date().toISOString();

  db.prepare("UPDATE properties SET title=?,description=?,price=?,location=?,status=?,updated_at=? WHERE id=?")
    .run(title, description, price, location, status, now, Number(id));

  // Remove individually deleted images (form field "remove_image_ids" as comma-separated)
  const removeIds = String(form.get("remove_image_ids") ?? "").split(",").map(s => s.trim()).filter(Boolean);
  for (const rid of removeIds) {
    const img = db.prepare("SELECT * FROM property_images WHERE id = ?").get(Number(rid)) as ImageRow | undefined;
    if (img) { deleteImage(img.file_path); db.prepare("DELETE FROM property_images WHERE id = ?").run(Number(rid)); }
  }

  // Append new uploaded images
  const files = form.getAll("images").filter((f): f is File => f instanceof File);
  const maxOrder = (db.prepare("SELECT COALESCE(MAX(sort_order),0) as m FROM property_images WHERE property_id = ?").get(Number(id)) as { m: number }).m;
  let order = maxOrder + 1;
  for (const file of files) {
    if (!file.type.startsWith("image/") || file.size > 25 * 1024 * 1024) continue;
    const buf = Buffer.from(await file.arrayBuffer());
    const fp = await saveImage(buf);
    db.prepare("INSERT INTO property_images (property_id,file_path,sort_order) VALUES (?,?,?)").run(Number(id), fp, order++);
  }

  const updated = db.prepare("SELECT * FROM properties WHERE id = ?").get(Number(id)) as PropertyRow;
  const imgs = db.prepare("SELECT * FROM property_images WHERE property_id = ? ORDER BY sort_order").all(Number(id)) as ImageRow[];
  return NextResponse.json({ ...updated, images: imgs.map(i => ({ id: i.id, filePath: i.file_path })) }, { headers: NS });
}

/** DELETE — removes record + all images from disk */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NS });
  const { id } = await params;
  const db = getDB();
  const imgs = db.prepare("SELECT * FROM property_images WHERE property_id = ?").all(Number(id)) as ImageRow[];
  for (const img of imgs) deleteImage(img.file_path);
  const ok = db.prepare("DELETE FROM properties WHERE id = ?").run(Number(id)).changes > 0;
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404, headers: NS });
  return NextResponse.json({ ok: true });
}
