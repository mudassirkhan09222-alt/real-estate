import { NextRequest, NextResponse } from "next/server";
import { getDB, type PropertyRow, type ImageRow } from "@/lib/db";

const NS = { "Cache-Control": "no-store" };

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get("page") ?? 1));
  const pageSize = Math.min(48, Math.max(1, Number(sp.get("pageSize") ?? 9)));
  const search = sp.get("search")?.trim();
  const status = sp.get("status") ?? "published";
  const db = getDB();

  const conds = ["p.status = ?"];
  const params: (string | number)[] = [status === "all" ? "published" : status];
  if (search) { conds.push("(p.title LIKE ? OR p.location LIKE ?)"); params.push(`%${search}%`, `%${search}%`); }
  const where = `WHERE ${conds.join(" AND ")}`;

  const total = (db.prepare(`SELECT COUNT(*) as c FROM properties p ${where}`).get(...params) as { c: number }).c;
  const rows = db.prepare(`SELECT p.* FROM properties p ${where} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`).all(...params, pageSize, (page - 1) * pageSize) as PropertyRow[];

  const items = rows.map(row => {
    const imgs = db.prepare("SELECT * FROM property_images WHERE property_id = ? ORDER BY sort_order").all(row.id) as ImageRow[];
    return {
      id: String(row.id), slug: String(row.id), title: row.title,
      summary: row.description.slice(0, 120), description: row.description,
      price: row.price, currency: "PKR", region: "Metropolitan", location: row.location,
      type: "Apartment", status: "available", bedrooms: 0, bathrooms: 0, areaSqft: 0,
      yieldPercent: 0, featured: false,
      images: imgs.map(i => ({ id: String(i.id), url: i.file_path, alt: row.title, width: 800, height: 600 })),
      createdAt: row.created_at, updatedAt: row.updated_at,
    };
  });

  return NextResponse.json({ items, total, page, pageSize, hasMore: page * pageSize < total }, { headers: NS });
}
