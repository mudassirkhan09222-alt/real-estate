import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import {
  dbGetProperty, dbGetImages, dbUpdateProperty,
  dbDeleteProperty, dbAddImage, dbDeleteImageById,
  dbDeleteImages,
} from "@/lib/db";
import { saveImage, deleteImage } from "@/lib/upload";

const NS = { "Cache-Control": "no-store" };

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await dbGetProperty(Number(id));
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404, headers: NS });
  const imgs = await dbGetImages(row.id);
  return NextResponse.json({ ...row, images: imgs.map(i => ({ id: i.id, filePath: i.file_path })) }, { headers: NS });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NS });
  const { id } = await params;

  const ex = await dbGetProperty(Number(id));
  if (!ex) return NextResponse.json({ error: "Not found" }, { status: 404, headers: NS });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Expected multipart" }, { status: 400, headers: NS });

  const title        = String(form.get("title") ?? ex.title).trim();
  const description  = String(form.get("description") ?? ex.description);
  const price        = Number(form.get("price") ?? ex.price);
  const location     = String(form.get("location") ?? ex.location);
  const status       = form.get("status") === "published" ? "published" : "draft";
  const availability = form.get("availability") === "sold_out" ? "sold_out" : "available";

  const updated = await dbUpdateProperty(Number(id), { title, description, price, location, status, availability });

  // Remove individually deleted images
  const removeIds = String(form.get("remove_image_ids") ?? "").split(",").map(s => s.trim()).filter(Boolean);
  for (const rid of removeIds) {
    const img = await dbDeleteImageById(Number(rid));
    if (img) deleteImage(img.file_path);
  }

  // Append new images
  const existing = await dbGetImages(Number(id));
  const maxOrder = existing.reduce((m, i) => Math.max(m, i.sort_order), -1);
  let order = maxOrder + 1;
  const files = form.getAll("images").filter((f): f is File => f instanceof File);
  for (const file of files) {
    if (!file.type.startsWith("image/") || file.size > 25 * 1024 * 1024) continue;
    const buf = Buffer.from(await file.arrayBuffer());
    const fp  = await saveImage(buf);
    await dbAddImage(Number(id), fp, order++);
  }

  const imgs = await dbGetImages(Number(id));
  return NextResponse.json(
    { ...updated, images: imgs.map(i => ({ id: i.id, filePath: i.file_path })) },
    { headers: NS }
  );
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NS });
  const { id } = await params;

  const imgs = await dbGetImages(Number(id));
  for (const img of imgs) deleteImage(img.file_path);
  await dbDeleteImages(Number(id));

  const ok = await dbDeleteProperty(Number(id));
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404, headers: NS });
  return NextResponse.json({ ok: true }, { headers: NS });
}
