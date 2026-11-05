import { NextRequest, NextResponse } from "next/server";
import { getDB, type PropertyRow, type ImageRow } from "@/lib/db";

const NS = { "Cache-Control": "no-store" };

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDB();
  const row = db.prepare("SELECT * FROM properties WHERE id = ?").get(Number(id)) as PropertyRow | undefined;
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404, headers: NS });
  const imgs = db.prepare("SELECT * FROM property_images WHERE property_id = ? ORDER BY sort_order").all(row.id) as ImageRow[];
  const item = {
    id: String(row.id), slug: String(row.id), title: row.title,
    summary: row.description.slice(0, 120), description: row.description,
    price: row.price, currency: "PKR", region: "Metropolitan", location: row.location,
    type: "Apartment", status: "available", bedrooms: 0, bathrooms: 0, areaSqft: 0,
    yieldPercent: 0, featured: false, availability: row.availability ?? "available",
    images: imgs.map(i => ({ id: String(i.id), url: i.file_path, alt: row.title, width: 800, height: 600 })),
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
  return NextResponse.json(item, { headers: NS });
}
