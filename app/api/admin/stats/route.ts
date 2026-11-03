import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET() {
  const db = getDB();
  return NextResponse.json({
    total:     (db.prepare("SELECT COUNT(*) as c FROM properties").get() as { c: number }).c,
    published: (db.prepare("SELECT COUNT(*) as c FROM properties WHERE status='published'").get() as { c: number }).c,
    draft:     (db.prepare("SELECT COUNT(*) as c FROM properties WHERE status='draft'").get() as { c: number }).c,
  }, { headers: { "Cache-Control": "no-store" } });
}
