/**
 * Shared domain types for the real-estate platform.
 *
 * The data model is intentionally storage-agnostic: `lib/db` is the only module
 * that persists these. Swapping the JSON repository for Postgres/Mongo only
 * requires reimplementing the repository in `lib/db` — every UI and API layer
 * consumes these types and the repository interface, never the storage directly.
 */

export const PROPERTY_TYPES = [
  "Apartment",
  "Villa",
  "Penthouse",
  "Townhouse",
  "Estate",
  "Land",
] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const PROPERTY_STATUSES = ["available", "sold", "off-market"] as const;
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

/** Generic region facets used by the dynamic location filter. */
export const REGIONS = [
  "Coastal",
  "Metropolitan",
  "Mountain",
  "Island",
  "Desert",
  "Countryside",
] as const;
export type Region = (typeof REGIONS)[number];

export interface PropertyImage {
  id: string;
  /** Public URL — a relative path ("/uploads/...") in dev, a CDN URL in production. */
  url: string;
  width: number;
  height: number;
  /** Tiny base64 placeholder for next/image `placeholder="blur"`. */
  blurDataURL?: string;
  alt: string;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  /** Short line shown on grid cards. */
  summary: string;
  /** Markdown body shown on the detail page. */
  description: string;
  price: number;
  currency: string;
  region: Region;
  /** Generic, brand-free location label, e.g. "Harbor District". */
  location: string;
  type: PropertyType;
  status: PropertyStatus;
  bedrooms: number;
  bathrooms: number;
  areaSqft: number;
  /** Projected gross yield %, consumed by the Yield Forecast calculator. */
  yieldPercent: number;
  featured: boolean;
  images: PropertyImage[];
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

/** Fields accepted on create/update (server fills id, slug, timestamps). */
export type PropertyInput = Omit<Property, "id" | "slug" | "createdAt" | "updatedAt">;

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface PropertyQuery {
  page?: number;
  pageSize?: number;
  region?: Region | "all";
  type?: PropertyType | "all";
  status?: PropertyStatus | "all";
  /** Free-text search across title + location + summary. */
  search?: string;
  featured?: boolean;
}
