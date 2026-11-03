import { NextRequest, NextResponse } from "next/server";
import { getProperty } from "@/lib/db";

/**
 * Public GET by ID — used by property detail page fallback fetch.
 * All mutations go through Payload CMS at /api/(payload)/properties/[id].
 */

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: NO_STORE });
  }
  return NextResponse.json(property, { headers: NO_STORE });
}
