import { NextRequest, NextResponse } from "next/server";
import { dbGetProperties, dbGetImages } from "@/lib/db";

const NS = { "Cache-Control": "no-store" };

export async function GET(req: NextRequest) {
  const sp       = req.nextUrl.searchParams;
  const page     = Math.max(1, Number(sp.get("page") ?? 1));
  const pageSize = Math.min(48, Math.max(1, Number(sp.get("pageSize") ?? 9)));
  const search   = sp.get("search")?.trim() ?? undefined;
  const statusPm = sp.get("status");
  const status   = statusPm && statusPm !== "all" ? statusPm : "published";

  const { rows, total } = await dbGetProperties({ status, search, page, pageSize });

  const items = await Promise.all(rows.map(async row => {
    const imgs = await dbGetImages(row.id);
    return {
      id: String(row.id), slug: String(row.id), title: row.title,
      summary: row.description.slice(0, 120), description: row.description,
      price: row.price, currency: "PKR", region: "Metropolitan", location: row.location,
      type: "Apartment", status: "available", bedrooms: 0, bathrooms: 0, areaSqft: 0,
      yieldPercent: 0, featured: false, availability: row.availability ?? "available",
      images: imgs.map(i => ({ id: String(i.id), url: i.file_path, alt: row.title, width: 800, height: 600 })),
      createdAt: row.created_at, updatedAt: row.updated_at,
    };
  }));

  return NextResponse.json({ items, total, page, pageSize, hasMore: page * pageSize < total }, { headers: NS });
}
