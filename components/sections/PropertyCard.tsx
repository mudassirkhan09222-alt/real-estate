import Link from "next/link";
import { Bath, Bed, Maximize2 } from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { formatCompactPrice, formatNumber } from "@/lib/format";
import type { Property } from "@/lib/types";

/**
 * Single property card. Pure CSS for hover (image zoom + lift) so it stays
 * cheap to render hundreds of times during infinite scroll — no per-card
 * framer-motion. Server-compatible.
 */
export function PropertyCard({ property }: { property: Property }) {
  const cover = property.images[0];
  const unavailable = property.status !== "available";

  return (
    <Link href={`/property/${property.id}`} className="group block focus-visible:outline-none">
      <article className="group/card relative overflow-hidden rounded-2xl bg-cream-50 ring-1 ring-espresso-900/5 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-luxe focus-within:-translate-y-1.5 focus-within:shadow-luxe">
        <div className="relative aspect-[4/3] overflow-hidden bg-cream-200">
          {cover ? (
            <OptimizedImage
              src={cover.url}
              alt={cover.alt || property.title}
              fill
              blurDataURL={cover.blurDataURL}
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
            />
          ) : null}

          {unavailable ? (
            <div className="absolute inset-0 bg-espresso-950/45" />
          ) : null}

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {property.featured ? (
              <span className="rounded-full bg-espresso-900/80 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-cream-50 backdrop-blur-sm">
                Featured
              </span>
            ) : null}
            {unavailable ? (
              <span className="rounded-full bg-cream-50/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-espresso-900 backdrop-blur-sm">
                {property.status === "sold" ? "Sold" : "Off Market"}
              </span>
            ) : null}
          </div>

          <div className="absolute bottom-4 right-4 rounded-full bg-cream-50/92 px-3.5 py-1.5 text-sm font-semibold text-espresso-900 backdrop-blur-sm">
            {formatCompactPrice(property.price, property.currency)}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-600">
              {property.region}
            </span>
            <span className="text-[11px] text-muted">{property.type}</span>
          </div>

          <h3 className="mt-2.5 font-serif text-xl leading-snug text-espresso-900 transition-colors group-hover/card:text-gold-600">
            {property.title}
          </h3>
          <p className="mt-1 text-sm text-muted">{property.location}</p>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-espresso-700">
            <span className="inline-flex items-center gap-1.5">
              <Bed size={14} className="text-gold-600" /> {property.bedrooms} bed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Bath size={14} className="text-gold-600" /> {property.bathrooms} bath
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Maximize2 size={14} className="text-gold-600" /> {formatNumber(property.areaSqft)} ft²
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-espresso-900/5 pt-4">
            <span className="text-sm text-muted">Forecast yield</span>
            <span className="font-serif text-lg text-gold-600">
              {property.yieldPercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
