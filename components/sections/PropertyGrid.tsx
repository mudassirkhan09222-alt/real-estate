"use client";

import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { Loader2, Search, X } from "lucide-react";
import { PropertyCard } from "./PropertyCard";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { PaginatedResult, Property } from "@/lib/types";

interface Filters {
  search: string;
}

const PAGE_SIZE = 9;

export function PropertyGrid({ initial }: { initial: PaginatedResult<Property> }) {
  const [filters, setFilters] = useState<Filters>({ search: "" });
  const [items, setItems] = useState<Property[]>(initial.items);
  const [page, setPage] = useState(initial.page);
  const [hasMore, setHasMore] = useState(initial.hasMore);
  const [total, setTotal] = useState(initial.total);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  const buildUrl = useCallback((p: number, f: Filters) => {
    const sp = new URLSearchParams({ page: String(p), pageSize: String(PAGE_SIZE) });
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

  // Refetch when filters change
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
      } catch { /* keep */ }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [filters, touched, buildUrl]);

  const updateFilter = (patch: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setTouched(true);
    setLoading(true);
  };

  const clearFilters = () => {
    setFilters({ search: "" });
    setTouched(true);
    setLoading(true);
  };

  return (
    <section id="properties" className="scroll-mt-20" style={{ backgroundColor: "#FAF6EF" }}>
      <div className="estatio-container py-16 md:py-24">
        <AnimatedSection>
          <SectionHeading
            eyebrow="Our Projects"
            title="Latest Projects & Properties"
            subtitle="Browse our current listings — updated live from the admin panel."
          />
        </AnimatedSection>

        {/* Search bar */}
        <AnimatedSection delay={0.05} className="mt-8">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7A6652]" />
              <input
                type="search"
                value={filters.search}
                onChange={(e) => updateFilter({ search: e.target.value })}
                placeholder="Search by title or location…"
                className="w-full rounded-full border border-[rgba(28,18,8,0.12)] bg-white py-2.5 pl-11 pr-4 text-sm text-[#1C1208] outline-none transition-colors focus:border-[#C8A96E]"
              />
            </div>
            {filters.search.trim() ? (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(28,18,8,0.12)] px-4 py-2.5 text-sm text-[#1C1208]"
              >
                Clear <X size={14} />
              </button>
            ) : null}
          </div>
          <p className="mt-4 text-sm" style={{ color: "#7A6652" }}>
            {total} {total === 1 ? "project" : "projects"}{filters.search.trim() ? " matched" : ""}
          </p>
        </AnimatedSection>

        {/* Grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => <PropertyCard key={p.id} property={p} />)}
          {loading ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />) : null}
        </div>

        {/* Empty state */}
        {!loading && items.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-[rgba(28,18,8,0.12)] py-20 text-center">
            <p className="font-serif text-2xl" style={{ color: "#1C1208" }}>No projects yet</p>
            <p className="mt-2 text-sm" style={{ color: "#7A6652" }}>
              Add projects from the <a href="/admin" className="underline hover:text-[#1C1208]">admin panel</a>.
            </p>
          </div>
        ) : null}

        {/* Load more */}
        {hasMore ? (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              disabled={loading}
              onClick={() => fetchPage(page + 1, true, filters)}
              className="inline-flex items-center gap-2 rounded-full border border-[rgba(28,18,8,0.12)] px-6 py-3 text-sm text-[#1C1208] transition-colors hover:bg-[#F2ECE1] disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? "Loading…" : "Load more projects"}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-[rgba(28,18,8,0.06)] bg-[#F2ECE1]">
      <div className="aspect-[4/3] bg-[#E5DDD0]" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-1/3 rounded bg-[#E5DDD0]" />
        <div className="h-5 w-3/4 rounded bg-[#E5DDD0]" />
        <div className="h-3 w-1/2 rounded bg-[#E5DDD0]/70" />
      </div>
    </div>
  );
}
