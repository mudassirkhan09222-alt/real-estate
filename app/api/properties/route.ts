import { NextRequest, NextResponse } from "next/server";
import { getProperties, createProperty } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import { REGIONS, PROPERTY_STATUSES, PROPERTY_TYPES } from "@/lib/types";
import type { PropertyInput, PropertyQuery, PropertyStatus, PropertyType, Region } from "@/lib/types";

const NO_STORE = { "Cache-Control": "no-store" };

function parseQuery(req: NextRequest): PropertyQuery {
  const sp = req.nextUrl.searchParams;
  const page = sp.get("page") ? Number(sp.get("page")) : undefined;
  const pageSize = sp.get("pageSize") ? Number(sp.get("pageSize")) : undefined;
  const region = sp.get("region") as Region | "all" | null;
  const type = sp.get("type") as PropertyType | "all" | null;
  const status = sp.get("status") as PropertyStatus | "all" | null;
  const search = sp.get("search") ?? undefined;
  const featured = sp.get("featured") === "true" ? true : undefined;
  return {
    page: page && Number.isFinite(page) ? page : undefined,
    pageSize: pageSize && Number.isFinite(pageSize) ? pageSize : undefined,
    region: region ?? undefined,
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

export async function POST(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
  }

  let body: Partial<PropertyInput>;
  try {
    body = (await req.json()) as Partial<PropertyInput>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: NO_STORE });
  }

  const errors: string[] = [];
  if (!body.title?.trim()) errors.push("title is required");
  if (typeof body.price !== "number" || body.price <= 0) errors.push("price must be a positive number");
  if (body.region && !REGIONS.includes(body.region)) errors.push("invalid region");
  if (body.type && !PROPERTY_TYPES.includes(body.type)) errors.push("invalid type");
  if (body.status && !PROPERTY_STATUSES.includes(body.status)) errors.push("invalid status");
  if (errors.length > 0) {
    return NextResponse.json({ error: "Validation failed", details: errors }, { status: 422, headers: NO_STORE });
  }

  const input: PropertyInput = {
    title: body.title!.trim(),
    summary: body.summary?.trim() ?? "",
    description: body.description?.trim() ?? "",
    price: body.price!,
    currency: body.currency?.trim() || "USD",
    region: body.region ?? "Metropolitan",
    location: body.location?.trim() || "",
    type: body.type ?? "Apartment",
    status: body.status ?? "available",
    bedrooms: Number(body.bedrooms) || 0,
    bathrooms: Number(body.bathrooms) || 0,
    areaSqft: Number(body.areaSqft) || 0,
    yieldPercent: Number(body.yieldPercent) || 0,
    featured: Boolean(body.featured),
    images: Array.isArray(body.images) ? body.images : [],
  };

  const property = await createProperty(input);
  // If the homepage is later switched to use cache, revalidate its tag here:
  //   revalidateTag("properties", "max");
  return NextResponse.json(property, { status: 201, headers: NO_STORE });
}
