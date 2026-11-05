"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";

interface Img  { id: number; filePath: string; }
interface Prop { id: number; title: string; location: string; price: number; status: string; created_at: string; images: Img[]; }

const PAGE = 12;

function StatusBadge({ status }: { status: string }) {
  const published = status === "published";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: published ? "#f0fdf4" : "#fefce8",
      color: published ? "#15803d" : "#b45309",
      border: `1px solid ${published ? "#bbf7d0" : "#fde68a"}`,
      borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: published ? "#22c55e" : "#f59e0b", display: "inline-block" }} />
      {published ? "Published" : "Draft"}
    </span>
  );
}

function Table() {
  const sp     = useSearchParams();
  const router = useRouter();
  const page   = Number(sp.get("page") ?? 1);
  const status = sp.get("status") ?? "all";
  const [search, setSearch]   = useState(sp.get("search") ?? "");
  const [items, setItems]     = useState<Prop[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const q = new URLSearchParams({ page: String(page), pageSize: String(PAGE) });
    if (status !== "all") q.set("status", status);
    if (search) q.set("search", search);
    const d = await fetch(`/api/admin/properties?${q}`, { cache: "no-store" }).then(r => r.json());
    setItems(d.items ?? []); setTotal(d.total ?? 0); setLoading(false);
  }, [page, status, search]);

  useEffect(() => { load(); }, [load]);

  async function del(id: number, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    await fetch(`/api/admin/properties/${id}`, { method: "DELETE" });
    load();
  }

  const pages = Math.ceil(total / PAGE);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: "#0f172a", fontSize: 26, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.02em" }}>Products</h1>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>{total} listings in total</p>
        </div>
        <Link href="/admin/products/new" style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: "#1e2a3b", color: "#fff", borderRadius: 9,
          padding: "10px 18px", textDecoration: "none", fontSize: 14, fontWeight: 600,
        }}>
          <span style={{ fontSize: 16 }}>+</span> Add Product
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 15 }}>🔍</span>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); router.push("/admin/products"); }}
            placeholder="Search products…"
            style={{
              background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8,
              padding: "9px 14px 9px 36px", color: "#0f172a", fontSize: 14,
              outline: "none", width: 260,
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["all", "published", "draft"].map(s => (
            <button key={s} onClick={() => router.push(`/admin/products${s !== "all" ? `?status=${s}` : ""}`)} style={{
              padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500,
              border: status === s ? "1px solid #1e2a3b" : "1px solid #e2e8f0",
              background: status === s ? "#1e2a3b" : "#fff",
              color: status === s ? "#fff" : "#475569",
              transition: "all .15s", textTransform: "capitalize",
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 40, textAlign: "center", color: "#94a3b8", fontSize: 14 }}>
          Loading…
        </div>
      ) : items.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "60px 40px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
          <p style={{ color: "#64748b", fontSize: 15, margin: "0 0 16px" }}>No products yet</p>
          <Link href="/admin/products/new" style={{ background: "#1e2a3b", color: "#fff", borderRadius: 8, padding: "10px 20px", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
            Add your first product
          </Link>
        </div>
      ) : (
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
          {/* Table head */}
          <div style={{ display: "grid", gridTemplateColumns: "48px 1fr 160px 120px 120px 140px", padding: "11px 20px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
            {["", "PRODUCT", "LOCATION", "PRICE", "STATUS", "ACTIONS"].map((h, i) => (
              <span key={i} style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em" }}>{h}</span>
            ))}
          </div>

          {items.map((p, idx) => (
            <div key={p.id} style={{
              display: "grid", gridTemplateColumns: "48px 1fr 160px 120px 120px 140px",
              padding: "14px 20px", alignItems: "center",
              borderBottom: idx < items.length - 1 ? "1px solid #f1f5f9" : "none",
              transition: "background .1s",
            }}
              onMouseEnter={e => (e.currentTarget.style.background = "#fafafa")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              {/* Thumbnail */}
              <div style={{ width: 36, height: 32, borderRadius: 6, overflow: "hidden", background: "#f1f5f9", position: "relative" }}>
                {p.images[0]
                  ? <Image src={p.images[0].filePath} alt={p.title} fill style={{ objectFit: "cover" }} sizes="36px" />
                  : <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: "#cbd5e1", fontSize: 14 }}>🏠</span>
                }
              </div>

              {/* Title */}
              <div>
                <div style={{ color: "#0f172a", fontWeight: 600, fontSize: 14 }}>{p.title}</div>
                <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 2 }}>{p.created_at.slice(0, 10)}</div>
              </div>

              <span style={{ color: "#475569", fontSize: 13 }}>{p.location || "—"}</span>

              <span style={{ color: "#0f172a", fontSize: 14, fontWeight: 600 }}>
                {p.price > 0 ? `PKR ${p.price.toLocaleString()}` : "—"}
              </span>

              <StatusBadge status={p.status} />

              <div style={{ display: "flex", gap: 8 }}>
                <Link href={`/admin/products/${p.id}`} style={{
                  background: "#f1f5f9", color: "#1e2a3b", border: "1px solid #e2e8f0",
                  borderRadius: 7, padding: "6px 14px", textDecoration: "none",
                  fontSize: 13, fontWeight: 600,
                }}>Edit</Link>
                <button onClick={() => del(p.id, p.title)} style={{
                  background: "#fff5f5", color: "#dc2626", border: "1px solid #fecaca",
                  borderRadius: 7, padding: "6px 14px", cursor: "pointer",
                  fontSize: 13, fontWeight: 600,
                }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: "flex", gap: 6, marginTop: 20, justifyContent: "center" }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map(n => {
            const active = n === page;
            return (
              <button key={n} onClick={() => router.push(`/admin/products?page=${n}`)} style={{
                padding: "7px 13px", borderRadius: 7, border: active ? "1px solid #1e2a3b" : "1px solid #e2e8f0",
                background: active ? "#1e2a3b" : "#fff",
                color: active ? "#fff" : "#475569",
                cursor: "pointer", fontWeight: 600, fontSize: 13,
              }}>{n}</button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return <Suspense fallback={<p style={{ color: "#64748b", padding: 40 }}>Loading…</p>}><Table /></Suspense>;
}
