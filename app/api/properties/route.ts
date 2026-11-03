import { NextRequest, NextResponse } from "next/server";
import { getProperties } from "@/lib/db";
import type { PropertyQuery, PropertyStatus, PropertyType } from "@/lib/types";

/**
 * Public GET endpoint — used by PropertyGrid for infinite scroll/filtering.
 * All mutations go through Payload CMS at /api/(payload)/properties.
 */

const NO_STORE = { "Cache-Control": "no-store" };

function parseQuery(req: NextRequest): PropertyQuery {
  const sp = req.nextUrl.searchParams;
  const page = sp.get("page") ? Number(sp.get("page")) : undefined;
  const pageSize = sp.get("pageSize") ? Number(sp.get("pageSize")) : undefined;
  const status = sp.get("status") as PropertyStatus | "all" | null;
  const type = sp.get("type") as PropertyType | "all" | null;
  const search = sp.get("search") ?? undefined;
  const featured = sp.get("featured") === "true" ? true : undefined;
  return {
    page: page && Number.isFinite(page) ? page : undefined,
    pageSize: pageSize && Number.isFinite(pageSize) ? pageSize : undefined,
    type: type ?? undefined,
    status: status ?? undefined,
    search,
    featured,
  };
}

export async function GET(req: NextRequest) {
  const result = await getProperties(parseQuery(req));
  return NextResponse.json(result, { headers: NO_STORE });
}
