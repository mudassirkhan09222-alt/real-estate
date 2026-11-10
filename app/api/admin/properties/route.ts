import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import {
  bootstrapDB, dbGetProperties, dbGetImages,
  dbCreateProperty, dbAddImage, type PropertyRow,
} from "@/lib/db";
import { saveImage } from "@/lib/upload";

const NS = { "Cache-Control": "no-store" };

export async function GET(req: NextRequest) {
  await bootstrapDB();
  const sp       = req.nextUrl.searchParams;
  const page     = Math.max(1, Number(sp.get("page") ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(sp.get("pageSize") ?? 12)));
  const status   = sp.get("status") ?? undefined;
  const search   = sp.get("search")?.trim() ?? undefined;

  const { rows, total } = await dbGetProperties({ status, search, page, pageSize });

  const items = await Promise.all(rows.map(async (row: PropertyRow) => {
    const imgs = await dbGetImages(row.id);
    return { ...row, images: imgs.map(i => ({ id: i.id, filePath: i.file_path })) };
  }));

  return NextResponse.json(
    { items, total, page, pageSize, hasMore: page * pageSize < total },
    { headers: NS }
  );
}

export async function POST(req: NextRequest) {
  if (!(await isAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NS });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Expected multipart" }, { status: 400, headers: NS });

  const title        = String(form.get("title") ?? "").trim();
  if (!title) return NextResponse.json({ error: "title required" }, { status: 422, headers: NS });

  const description  = String(form.get("description") ?? "");
  const price        = Number(form.get("price") ?? 0);
  const location     = String(form.get("location") ?? "");
  const status       = form.get("status") === "published" ? "published" : "draft";
  const availability = form.get("availability") === "sold_out" ? "sold_out" : "available";

  const property = await dbCreateProperty({ title, description, price, location, status, availability });

  const files = form.getAll("images").filter((f): f is File => f instanceof File);
  let order = 0;
  for (const file of files) {
    if (!file.type.startsWith("image/") || file.size > 25 * 1024 * 1024) continue;
    const buf = Buffer.from(await file.arrayBuffer());
    const fp  = await saveImage(buf);
    await dbAddImage(property.id, fp, order++);
  }

  const imgs = await dbGetImages(property.id);
  return NextResponse.json(
    { ...property, images: imgs.map(i => ({ id: i.id, filePath: i.file_path })) },
    { status: 201, headers: NS }
  );
}
