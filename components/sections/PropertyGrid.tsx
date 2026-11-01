"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Loader2, Search, X } from "lucide-react";
import { PropertyCard } from "./PropertyCard";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PROPERTY_TYPES, REGIONS } from "@/lib/types";
import type { PaginatedResult, Property, PropertyType, Region } from "@/lib/types";

interface Filters {
  region: Region | "all";
  type: PropertyType | "all";
  search: string;
}

const PAGE_SIZE = 9;

export function PropertyGrid({ initial }: { initial: PaginatedResult<Property> }) {
  const [filters, setFilters] = useState<Filters>({ region: "all", type: "all", search: "" });
  const [items, setItems] = useState<Property[]>(initial.items);
  const [page, setPage] = useState(initial.page);
  const [hasMore, setHasMore] = useState(initial.hasMore);
  const [total, setTotal] = useState(initial.total);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);

  const buildUrl = useCallback((p: number, f: Filters) => {
    const sp = new URLSearchParams({ page: String(p), pageSize: String(PAGE_SIZE) });
    if (f.region !== "all") sp.set("region", f.region);
    if (f.type !== "all") sp.set("type", f.type);
    if (f.search.trim()) sp.set("search", f.search.trim());
    return `/api/properties?${sp.toString()}`;
  }, []);

  const fetchPage = useCallback(
    async (p: number, append: boolean, f: Filters) => {
      setLoading(true);
      try {
        const res = await fetch(buildUrl(p, f), { cache: "no-store" });
        if (!res.ok) throw new Error("fetch failed");
        const data: PaginatedResult<Property> = await res.json();
        setItems((prev) => (append ? [...prev, ...data.items] : data.items));
        setPage(data.page);
        setHasMore(data.hasMore);
        setTotal(data.total);
      } catch {
        /* keep existing list on error */
      } finally {
        setLoading(false);
      }
    },
    [buildUrl],
  );

  // Refetch from page 1 when the user changes a filter. All setState happens
  // after `await`, so nothing writes state synchronously inside the effect.
  useEffect(() => {
    if (!touched) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch(buildUrl(1, filters), { cache: "no-store" });
        if (!active || !res.ok) return;
        const data: PaginatedResult<Property> = await res.json();
        if (!active) return;
        setItems(data.items);
        setPage(data.page);
        setHasMore(data.hasMore);
        setTotal(data.total);
      } catch {
        /* keep existing list on error */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [filters, touched, buildUrl]);

  // React to the hero search bar (decoupled via a CustomEvent).
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as Partial<Filters> | undefined;
      if (!detail) return;
      setFilters((prev) => ({
        region: (detail.region as Region) ?? prev.region,
        type: (detail.type as PropertyType) ?? prev.type,
        search: detail.search ?? prev.search,
      }));
      setTouched(true);
      setLoading(true);
    };
    window.addEventListener("property-filter", handler as EventListener);
    return () => window.removeEventListener("property-filter", handler as EventListener);
  }, []);

  // Infinite scroll via IntersectionObserver on a trailing sentinel.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading) {
          fetchPage(page + 1, true, filters);
        }
      },
      { rootMargin: "500px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading, page, fetchPage, filters]);

  const updateFilter = (patch: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setTouched(true);
    setLoading(true);
  };

  const clearFilters = () => {
    setFilters({ region: "all", type: "all", search: "" });
    setTouched(true);
    setLoading(true);
  };

  const activeCount =
    (filters.region !== "all" ? 1 : 0) + (filters.type !== "all" ? 1 : 0) + (filters.search.trim() ? 1 : 0);

  return (
    <section id="properties" className="bg-cream-50 py-24 scroll-mt-24">
      <div className="container-luxe">
        <AnimatedSection>
          <SectionHeading
            eyebrow="Access International Property"
            title="A curated portfolio across regions"
            subtitle="Vetted, investment-grade holdings with transparent yield forecasts and protected tenure. Filter by region or type to refine the collection."
          />
        </AnimatedSection>

        {/* Dynamic location + type + search filter bar */}
        <AnimatedSection delay={0.05} className="mt-10">
          <div className="flex flex-col gap-4 rounded-2xl border border-espresso-900/8 bg-cream-100/60 p-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={filters.search}
                onChange={(e) => updateFilter({ search: e.target.value })}
                placeholder="Search by title or location…"
                className="w-full rounded-full border border-espresso-900/10 bg-cream-50 py-2.5 pl-11 pr-4 text-sm text-espresso-900 outline-none transition-colors placeholder:text-muted focus:border-gold-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <FilterSelect
                value={filters.region}
                onChange={(v) => updateFilter({ region: v as Region | "all" })}
                options={[{ value: "all", label: "All regions" }, ...REGIONS.map((r) => ({ value: r, label: r }))]}
              />
              <FilterSelect
                value={filters.type}
                onChange={(v) => updateFilter({ type: v as PropertyType | "all" })}
                options={[{ value: "all", label: "All types" }, ...PROPERTY_TYPES.map((t) => ({ value: t, label: t }))]}
              />
              {activeCount > 0 ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1.5 rounded-full border border-espresso-900/10 px-4 py-2.5 text-sm text-espresso-700 transition-colors hover:bg-cream-50"
                >
                  Clear <X size={14} />
                </button>
              ) : null}
            </div>
          </div>

          {/* region chips */}
          <div className="mt-4 flex flex-wrap gap-2">
            {(["all", ...REGIONS] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => updateFilter({ region: r })}
                className={clsx(
                  "rounded-full px-4 py-2 text-sm transition-all duration-200",
                  filters.region === r
                    ? "bg-espresso-900 text-cream-50"
                    : "border border-espresso-900/10 text-espresso-700 hover:border-gold-500 hover:text-espresso-900",
                )}
              >
                {r === "all" ? "All Regions" : r}
              </button>
            ))}
          </div>
        </AnimatedSection>

        {/* Result count */}
        <p className="mt-8 text-sm text-muted">
          {total} {total === 1 ? "holding" : "holdings"}
          {activeCount > 0 ? " matched" : ""}
        </p>

        {/* Grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)
            : null}
        </div>

        {/* Empty state */}
        {!loading && items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-espresso-900/10 py-20 text-center">
            <p className="font-serif text-2xl text-espresso-900">No holdings match those filters</p>
            <p className="mt-2 text-sm text-muted">Try widening your search or clearing the filters.</p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-full bg-espresso-900 px-5 py-2.5 text-sm text-cream-50"
            >
              Clear filters
            </button>
          </div>
        ) : null}

        {/* Sentinel + manual fallback */}
        <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />
        <div className="mt-10 flex flex-col items-center gap-3">
          {hasMore ? (
            <button
              type="button"
              disabled={loading}
              onClick={() => fetchPage(page + 1, true, filters)}
              className="inline-flex items-center gap-2 rounded-full border border-espresso-900/10 px-6 py-3 text-sm text-espresso-800 transition-colors hover:bg-cream-100 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? "Loading" : "Load more holdings"}
            </button>
          ) : items.length > 0 ? (
            <p className="text-sm text-muted">You’ve reached the end of the collection.</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-full border border-espresso-900/10 bg-cream-50 px-4 py-2.5 text-sm text-espresso-900 outline-none transition-colors focus:border-gold-500"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-espresso-900/5 bg-cream-100/40">
      <div className="aspect-[4/3] bg-cream-200/60" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-1/3 rounded bg-cream-200/70" />
        <div className="h-5 w-3/4 rounded bg-cream-200/70" />
        <div className="h-3 w-1/2 rounded bg-cream-200/50" />
        <div className="h-8 rounded bg-cream-200/40" />
      </div>
    </div>
  );
}
