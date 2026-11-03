/**
 * Property repository — Payload CMS Local API edition.
 *
 * Public interface is IDENTICAL to the old JSON-file version so every
 * component, page, and API route that calls these functions keeps working
 * without changes. Payload replaces the storage, auth, and admin UI.
 *
 * The Local API runs in-process — no HTTP round-trip, no cold-start penalty.
 */

import type { PaginatedResult, Property, PropertyImage, PropertyQuery } from "./types";

/** Lazily resolves Payload to avoid importing it at module-eval time. */
async function getPayload() {
  const { getPayload: gp } = await import("payload");
  const config = await import("@payload-config");
  return gp({ config: config.default });
}

/** Maps a Payload Property document to our frontend Property shape. */
function toProperty(doc: Record<string, unknown>): Property {
  const images: PropertyImage[] = [];

  const rawImages = doc.images as Array<Record<string, unknown>> | undefined;
  if (Array.isArray(rawImages)) {
    for (const item of rawImages) {
      const media = item.image as Record<string, unknown> | null | undefined;
      if (!media || typeof media !== "object") continue;

      const url = typeof media.url === "string" ? media.url : "";
      // Payload stores local uploads with relative URLs like /media/...
      // They're served by Next.js directly from /public/media/
      images.push({
        id: String(media.id ?? item.id ?? Math.random()),
        url,
        width: typeof media.width === "number" ? media.width : 800,
        height: typeof media.height === "number" ? media.height : 600,
        blurDataURL: undefined,
        alt: typeof media.alt === "string" ? media.alt : (typeof item.caption === "string" ? item.caption : ""),
      });
    }
  }

  return {
    id: String(doc.id),
    slug: String(doc.id), // use ID as slug; Payload doesn't auto-generate slugs unless you add a hook
    title: String(doc.title ?? ""),
    summary: String(doc.summary ?? ""),
    description: String(doc.description ?? ""),
    price: typeof doc.price === "number" ? doc.price : 0,
    currency: String(doc.currency ?? "PKR"),
    region: "Metropolitan" as Property["region"],
    location: String(doc.location ?? ""),
    type: "Apartment" as Property["type"],
    status: (doc.status as Property["status"]) ?? "available",
    bedrooms: typeof doc.bedrooms === "number" ? doc.bedrooms : 0,
    bathrooms: typeof doc.bathrooms === "number" ? doc.bathrooms : 0,
    areaSqft: typeof doc.areaSize === "number" ? doc.areaSize : 0,
    yieldPercent: typeof doc.yieldPercent === "number" ? doc.yieldPercent : 0,
    featured: Boolean(doc.featured),
    images,
    createdAt: String(doc.createdAt ?? new Date().toISOString()),
    updatedAt: String(doc.updatedAt ?? new Date().toISOString()),
  };
}

export async function getProperties(
  query: PropertyQuery = {},
): Promise<PaginatedResult<Property>> {
  const payload = await getPayload();

  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, query.pageSize ?? 9));

  // Build Payload where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {
    _status: { equals: "published" },
  };

  if (query.status && query.status !== "all") {
    where.status = { equals: query.status };
  }
  if (query.featured) {
    where.featured = { equals: true };
  }
  if (query.search?.trim()) {
    where.or = [
      { title: { contains: query.search.trim() } },
      { location: { contains: query.search.trim() } },
      { summary: { contains: query.search.trim() } },
    ];
  }

  const result = await payload.find({
    collection: "properties",
    where,
    page,
    limit: pageSize,
    sort: "-createdAt",
    depth: 2, // resolve media relationships
  });

  const items = result.docs.map((doc) =>
    toProperty(doc as unknown as Record<string, unknown>),
  );

  // Featured-first sort client-side (Payload doesn't easily combine multi-sort)
  items.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return 0;
  });

  return {
    items,
    page: result.page ?? page,
    pageSize,
    total: result.totalDocs,
    hasMore: result.hasNextPage,
  };
}

export async function getProperty(idOrSlug: string): Promise<Property | null> {
  const payload = await getPayload();

  // Try by ID first
  try {
    const doc = await payload.findByID({
      collection: "properties",
      id: idOrSlug,
      depth: 2,
    });
    if (doc) return toProperty(doc as unknown as Record<string, unknown>);
  } catch {
    // Not found by ID — fall through to slug search
  }

  // Try by title-based slug match
  const result = await payload.find({
    collection: "properties",
    where: { title: { equals: idOrSlug } },
    limit: 1,
    depth: 2,
  });
  const doc = result.docs[0];
  if (!doc) return null;
  return toProperty(doc as unknown as Record<string, unknown>);
}

export async function listAllSlugs(): Promise<{ id: string; slug: string }[]> {
  const payload = await getPayload();
  const result = await payload.find({
    collection: "properties",
    where: { _status: { equals: "published" } },
    limit: 1000,
    depth: 0,
    select: { id: true },
  });
  return result.docs.map((doc) => ({
    id: String(doc.id),
    slug: String(doc.id),
  }));
}

export async function countProperties(): Promise<number> {
  const payload = await getPayload();
  const result = await payload.find({
    collection: "properties",
    where: { _status: { equals: "published" } },
    limit: 1,
    depth: 0,
  });
  return result.totalDocs;
}
