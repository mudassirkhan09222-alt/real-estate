"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, PlusCircle, Star, Globe2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { formatCompactPrice } from "@/lib/format";
import { REGIONS } from "@/lib/types";
import type { PaginatedResult, Property } from "@/lib/types";

export default function AdminDashboardPage() {
  const [recent, setRecent] = useState<PaginatedResult<Property> | null>(null);
  const [featuredCount, setFeaturedCount] = useState(0);

  useEffect(() => {
    fetch("/api/properties?page=1&pageSize=5", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: PaginatedResult<Property>) => setRecent(d))
      .catch(() => {});
    fetch("/api/properties?featured=true&page=1&pageSize=1", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: PaginatedResult<Property>) => setFeaturedCount(d.total))
      .catch(() => {});
  }, []);

  const total = recent?.total ?? 0;

  return (
    <AdminShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-espresso-900">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">Overview of the catalogue and quick actions.</p>
        </div>
        <Link
          href="/admin/properties/new"
          className="inline-flex items-center gap-2 rounded-full bg-espresso-900 px-5 py-3 text-sm font-medium text-cream-50 transition-colors hover:bg-espresso-800"
        >
          <PlusCircle size={15} /> New listing
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat icon={<Building2 size={18} />} label="Total holdings" value={String(total)} />
        <Stat icon={<Star size={18} />} label="Featured" value={String(featuredCount)} />
        <Stat icon={<Globe2 size={18} />} label="Regions covered" value={String(REGIONS.length)} />
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-espresso-900">Recent listings</h2>
          <Link href="/admin/properties" className="text-sm text-gold-600 hover:text-gold-500">View all</Link>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-espresso-900/8 bg-cream-50">
          {!recent ? (
            <p className="p-6 text-sm text-muted">Loading…</p>
          ) : recent.items.length === 0 ? (
            <p className="p-6 text-sm text-muted">No listings yet. Create your first listing.</p>
          ) : (
            <ul className="divide-y divide-espresso-900/5">
              {recent.items.map((p) => (
                <li key={p.id} className="flex items-center gap-4 p-4">
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-cream-200">
                    {p.images[0] ? (
                      <OptimizedImage src={p.images[0].url} alt={p.title} fill sizes="80px" className="object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/properties/${p.id}`} className="block truncate font-medium text-espresso-900 hover:text-gold-600">
                      {p.title}
                    </Link>
                    <p className="truncate text-xs text-muted">{p.region} · {p.location}</p>
                  </div>
                  <span className="hidden text-sm text-espresso-700 sm:block">{formatCompactPrice(p.price, p.currency)}</span>
                  <span className="hidden text-xs uppercase tracking-wide text-muted md:block">{p.status}</span>
                  <Link href={`/admin/properties/${p.id}`} className="rounded-full border border-espresso-900/10 px-4 py-1.5 text-xs text-espresso-800 hover:bg-cream-100">
                    Edit
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </AdminShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-espresso-900/8 bg-cream-100/40 p-5">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-espresso-900 text-gold-400">{icon}</span>
      <div>
        <p className="font-serif text-2xl text-espresso-900">{value}</p>
        <p className="text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
      </div>
    </div>
  );
}
