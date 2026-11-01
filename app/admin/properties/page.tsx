"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, PlusCircle, Search, Trash2, Loader2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { formatCompactPrice } from "@/lib/format";
import type { PaginatedResult, Property } from "@/lib/types";

const PAGE_SIZE = 12;

export default function AdminPropertiesPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<PaginatedResult<Property> | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = useCallback(async () => {
    const sp = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (search.trim()) sp.set("search", search.trim());
    const res = await fetch(`/api/properties?${sp.toString()}`, { cache: "no-store" });
    const json: PaginatedResult<Property> = await res.json();
    setData(json);
    setLoading(false);
  }, [page, search]);

  // Fetch when page/search changes. All setState happens after `await`, so the
  // effect body performs no synchronous state writes (cacheComponents lint).
  useEffect(() => {
    let active = true;
    (async () => {
      const sp = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
      if (search.trim()) sp.set("search", search.trim());
      try {
        const res = await fetch(`/api/properties?${sp.toString()}`, { cache: "no-store" });
        if (!active) return;
        const json: PaginatedResult<Property> = await res.json();
        if (!active) return;
        setData(json);
        setLoading(false);
      } catch {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [page, search]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPage(1);
    setSearch(searchInput.trim());
  };

  const onDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    await fetch(`/api/properties/${id}`, { method: "DELETE" });
    setDeleting(null);
    // If we deleted the last item on a page beyond page 1, step back.
    if (data && data.items.length === 1 && page > 1) setPage((p) => p - 1);
    else load();
  };

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-espresso-900">Properties</h1>
          <p className="mt-1 text-sm text-muted">{data?.total ?? "—"} listings in the catalogue.</p>
        </div>
        <Link
          href="/admin/properties/new"
          className="inline-flex items-center gap-2 rounded-full bg-espresso-900 px-5 py-3 text-sm font-medium text-cream-50 transition-colors hover:bg-espresso-800"
        >
          <PlusCircle size={15} /> New listing
        </Link>
      </div>

      <form onSubmit={onSearch} className="mt-6 flex max-w-md gap-2">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search title or location…"
            className="w-full rounded-full border border-espresso-900/10 bg-cream-50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-gold-500"
          />
        </div>
        <button type="submit" className="rounded-full border border-espresso-900/10 px-5 py-2.5 text-sm text-espresso-800 hover:bg-cream-100">Search</button>
      </form>

      <div className="mt-6 overflow-hidden rounded-2xl border border-espresso-900/8 bg-cream-50">
        <div className="hidden grid-cols-[1.6fr_1fr_0.8fr_0.8fr_0.6fr_auto] gap-4 border-b border-espresso-900/5 px-5 py-3 text-[11px] font-medium uppercase tracking-[0.12em] text-muted sm:grid">
          <span>Property</span><span>Region</span><span>Type</span><span>Price</span><span>Status</span><span className="text-right">Actions</span>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-muted">Loading…</p>
        ) : !data || data.items.length === 0 ? (
          <p className="p-6 text-sm text-muted">No listings found.</p>
        ) : (
          <ul className="divide-y divide-espresso-900/5">
            {data.items.map((p) => (
              <li key={p.id} className="grid grid-cols-1 gap-3 px-5 py-3 sm:grid-cols-[1.6fr_1fr_0.8fr_0.8fr_0.6fr_auto] sm:items-center sm:gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-cream-200">
                    {p.images[0] ? <OptimizedImage src={p.images[0].url} alt={p.title} fill sizes="64px" className="object-cover" /> : null}
                  </div>
                  <Link href={`/admin/properties/${p.id}`} className="min-w-0 truncate font-medium text-espresso-900 hover:text-gold-600">
                    {p.title} {p.featured ? <span className="text-gold-500">★</span> : null}
                  </Link>
                </div>
                <span className="text-sm text-muted">{p.region}</span>
                <span className="text-sm text-muted">{p.type}</span>
                <span className="text-sm text-espresso-800">{formatCompactPrice(p.price, p.currency)}</span>
                <span className="text-xs uppercase tracking-wide text-muted">{p.status}</span>
                <div className="flex items-center gap-2 sm:justify-end">
                  <Link href={`/admin/properties/${p.id}`} className="rounded-full border border-espresso-900/10 px-3.5 py-1.5 text-xs text-espresso-800 hover:bg-cream-100">Edit</Link>
                  <button
                    onClick={() => onDelete(p.id, p.title)}
                    className="grid h-8 w-8 place-items-center rounded-full border border-espresso-900/10 text-red-500 hover:bg-red-50"
                    aria-label={`Delete ${p.title}`}
                  >
                    {deleting === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {data && (data.page > 1 || data.hasMore) ? (
        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            disabled={data.page <= 1}
            onClick={() => {
              setLoading(true);
              setPage((p) => p - 1);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-espresso-900/10 px-4 py-2 text-sm disabled:opacity-40"
          >
            <ChevronLeft size={15} /> Prev
          </button>
          <span className="text-sm text-muted">Page {data.page}</span>
          <button
            type="button"
            disabled={!data.hasMore}
            onClick={() => {
              setLoading(true);
              setPage((p) => p + 1);
            }}
            className="inline-flex items-center gap-1.5 rounded-full border border-espresso-900/10 px-4 py-2 text-sm disabled:opacity-40"
          >
            Next <ChevronRight size={15} />
          </button>
        </div>
      ) : null}
    </AdminShell>
  );
}
