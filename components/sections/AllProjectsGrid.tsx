"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { PropertyCard } from "./PropertyCard";
import type { PaginatedResult, Property } from "@/lib/types";

const PAGE_SIZE = 12;

export function AllProjectsGrid({ initial }: { initial: PaginatedResult<Property> }) {
  const [items,   setItems]   = useState<Property[]>(initial.items);
  const [page,    setPage]    = useState(initial.page);
  const [hasMore, setHasMore] = useState(initial.hasMore);
  const [total,   setTotal]   = useState(initial.total);
  const [search,  setSearch]  = useState("");
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const searchRef   = useRef(search);
  searchRef.current = search;

  const fetchPage = useCallback(async (p: number, append: boolean, q: string) => {
    setLoading(true);
    try {
      const sp = new URLSearchParams({ page: String(p), pageSize: String(PAGE_SIZE) });
      if (q.trim()) sp.set("search", q.trim());
      const res = await fetch(`/api/properties?${sp}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data: PaginatedResult<Property> = await res.json();
      setItems(prev => append ? [...prev, ...data.items] : data.items);
      setPage(data.page);
      setHasMore(data.hasMore);
      setTotal(data.total);
    } catch { /* keep */ }
    finally { setLoading(false); }
  }, []);

  // Search refetch
  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const sp = new URLSearchParams({ page: "1", pageSize: String(PAGE_SIZE) });
        if (search.trim()) sp.set("search", search.trim());
        const res = await fetch(`/api/properties?${sp}`, { cache: "no-store" });
        if (!active || !res.ok) return;
        const data: PaginatedResult<Property> = await res.json();
        if (!active) return;
        setItems(data.items); setPage(data.page); setHasMore(data.hasMore); setTotal(data.total);
      } catch { /* keep */ }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting && hasMore && !loading)
        fetchPage(page + 1, true, searchRef.current);
    }, { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading, page, fetchPage]);

  return (
    <div>
      {/* Search + count */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#7A6652]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title or location…"
            className="w-full rounded-full border border-[rgba(28,18,8,0.12)] bg-white py-2.5 pl-11 pr-4 text-sm text-[#1C1208] outline-none"
          />
        </div>
        {search && (
          <button onClick={() => setSearch("")} className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(28,18,8,0.12)] px-4 py-2.5 text-sm text-[#1C1208]">
            Clear <X size={13} />
          </button>
        )}
        <p style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "#7A6652" }}>
          {total} {total === 1 ? "project" : "projects"}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(p => <PropertyCard key={p.id} property={p} />)}
        {loading && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>

      {/* Empty */}
      {!loading && items.length === 0 && (
        <div className="mt-20 text-center">
          <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.8rem", color: "#1C1208" }}>No projects found</p>
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#7A6652", marginTop: 6 }}>Try a different search term.</p>
        </div>
      )}

      {/* Sentinel */}
      <div ref={sentinelRef} className="h-1" />

      {/* Manual load more */}
      {hasMore && !loading && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => fetchPage(page + 1, true, search)}
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(28,18,8,0.12)] px-7 py-3 text-sm text-[#1C1208] hover:bg-[#F2ECE1]"
            style={{ fontFamily: "var(--font-inter)", fontWeight: 500 }}
          >
            Load more projects
          </button>
        </div>
      )}
      {loading && (
        <div className="mt-8 flex justify-center">
          <Loader2 size={22} className="animate-spin text-[#C8A96E]" />
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-[rgba(28,18,8,0.06)]" style={{ background: "#F2ECE1" }}>
      <div className="aspect-[4/3]" style={{ background: "#E5DDD0" }} />
      <div className="space-y-3 p-5">
        <div className="h-3 w-1/3 rounded" style={{ background: "#E5DDD0" }} />
        <div className="h-5 w-3/4 rounded" style={{ background: "#E5DDD0" }} />
        <div className="h-3 w-1/2 rounded" style={{ background: "#DDD4C5" }} />
      </div>
    </div>
  );
}
