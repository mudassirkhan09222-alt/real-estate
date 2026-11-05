import Link from "next/link";
import { Bath, Bed, Maximize2 } from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { formatCompactPrice, formatNumber } from "@/lib/format";
import type { Property } from "@/lib/types";

export function PropertyCard({ property }: { property: Property }) {
  const cover = property.images[0];
  const isSoldOut  = (property as Property & { availability?: string }).availability === "sold_out";
  const unavailable = property.status !== "available";

  return (
    <Link href={`/property/${property.id}`} className="group block focus-visible:outline-none">
      <article className="group/card relative overflow-hidden rounded-2xl bg-cream-50 ring-1 ring-espresso-900/5 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-luxe focus-within:-translate-y-1.5 focus-within:shadow-luxe">

        {/* ── Image ── */}
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

          {/* Dim overlay for sold-out */}
          {isSoldOut ? <div className="absolute inset-0 bg-espresso-950/50" /> : null}
          {unavailable && !isSoldOut ? <div className="absolute inset-0 bg-espresso-950/35" /> : null}

          {/* Top-left badges */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {property.featured && !isSoldOut ? (
              <span className="rounded-full bg-espresso-900/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-cream-50 backdrop-blur-sm">
                Featured
              </span>
            ) : null}
            {isSoldOut ? (
              <span className="rounded-full bg-red-600/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                Sold Out
              </span>
            ) : (
              <span className="rounded-full bg-emerald-600/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                Available
              </span>
            )}
          </div>
        </div>

        {/* ── Content ── */}
        <div className="p-5">
          {/* Region + type row */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-600">
              {property.region}
            </span>
            <span className="text-[11px] text-muted">{property.type}</span>
          </div>

          {/* Title */}
          <h3 className="mt-2.5 font-serif text-xl leading-snug text-espresso-900 transition-colors group-hover/card:text-gold-600">
            {property.title}
          </h3>
          <p className="mt-1 text-sm text-muted">{property.location}</p>

          {/* Price — prominent, bold */}
          <p className="mt-3 text-[1.35rem] font-bold leading-tight text-espresso-900">
            <span className="text-gold-600">
              {property.price > 0
                ? formatCompactPrice(property.price, property.currency)
                : `${property.currency} —`}
            </span>
          </p>

          {/* Specs row */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-espresso-700">
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
        </div>
      </article>
    </Link>
  );
}
