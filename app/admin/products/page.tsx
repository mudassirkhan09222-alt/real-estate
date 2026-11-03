"use client";
import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";

interface Img  { id: number; filePath: string; }
interface Prop { id: number; title: string; location: string; price: number; status: string; created_at: string; images: Img[]; }

const PAGE = 12;

function Table() {
  const sp = useSearchParams(); const router = useRouter();
  const page = Number(sp.get("page") ?? 1);
  const status = sp.get("status") ?? "all";
  const [search, setSearch] = useState(sp.get("search") ?? "");
  const [items, setItems] = useState<Prop[]>([]);
  const [total, setTotal] = useState(0);
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
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await fetch(`/api/admin/properties/${id}`, { method: "DELETE" });
    load();
  }

  function go(p: number) {
    const q = new URLSearchParams({ page: String(p) });
    if (status !== "all") q.set("status", status);
    if (search) q.set("search", search);
    router.push(`/admin/products?${q}`);
  }

  const pages = Math.ceil(total / PAGE);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 800, margin: 0 }}>Properties</h1>
          <p style={{ color: "#666", fontSize: 13, margin: "4px 0 0" }}>{total} total</p>
        </div>
        <Link href="/admin/products/new" style={{ background: "#C8A96E", color: "#0c0c0c", borderRadius: 10, padding: "10px 20px", textDecoration: "none", fontWeight: 700, fontSize: 14 }}>＋ Add Property</Link>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <input value={search} onChange={e => { setSearch(e.target.value); router.push("/admin/products"); }} placeholder="Search title or location…"
          style={{ background: "#161616", border: "1px solid #2a2a2a", borderRadius: 8, padding: "9px 14px", color: "#fff", fontSize: 14, outline: "none", width: 280 }} />
        {["all","published","draft"].map(s => (
          <button key={s} onClick={() => router.push(`/admin/products${s !== "all" ? `?status=${s}` : ""}`)}
            style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid #2a2a2a", background: status === s ? "#1e1e1e" : "transparent", color: status === s ? "#C8A96E" : "#777", cursor: "pointer", fontSize: 13, fontWeight: 600, textTransform: "capitalize" }}>
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? <p style={{ color: "#666" }}>Loading…</p> :
        items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#555" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏠</div>
            <p>No properties yet. <Link href="/admin/products/new" style={{ color: "#C8A96E" }}>Add the first one →</Link></p>
          </div>
        ) : (
          <div style={{ background: "#161616", border: "1px solid #222", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #222" }}>
                  {["","Title","Location","Price","Status",""].map((h,i) => (
                    <th key={i} style={{ padding: "11px 16px", color: "#555", fontSize: 11, textAlign: "left", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map(p => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                    <td style={{ padding: "10px 16px", width: 56 }}>
                      {p.images[0]
                        ? <div style={{ width: 48, height: 38, borderRadius: 6, overflow: "hidden", position: "relative" }}><Image src={p.images[0].filePath} alt={p.title} fill style={{ objectFit: "cover" }} sizes="48px" /></div>
                        : <div style={{ width: 48, height: 38, borderRadius: 6, background: "#222", display: "grid", placeItems: "center", color: "#444", fontSize: 18 }}>🏠</div>
                      }
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{p.title}</div>
                      <div style={{ color: "#555", fontSize: 12, marginTop: 2 }}>{p.created_at.slice(0,10)}</div>
                    </td>
                    <td style={{ padding: "10px 16px", color: "#888", fontSize: 13 }}>{p.location || "—"}</td>
                    <td style={{ padding: "10px 16px", color: "#C8A96E", fontWeight: 700, fontSize: 14 }}>PKR {p.price.toLocaleString()}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ background: p.status === "published" ? "#14532d" : "#1c1c1c", color: p.status === "published" ? "#4ade80" : "#facc15", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>{p.status}</span>
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Link href={`/admin/products/${p.id}`} style={{ background: "#1e1e1e", color: "#C8A96E", border: "1px solid #2a2a2a", borderRadius: 7, padding: "6px 14px", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>Edit</Link>
                        <button onClick={() => del(p.id, p.title)} style={{ background: "none", color: "#f87171", border: "1px solid #f8717130", borderRadius: 7, padding: "6px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: "flex", gap: 8, marginTop: 20, justifyContent: "center" }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => go(n)} style={{ padding: "8px 14px", borderRadius: 8, border: "1px solid #2a2a2a", background: n === page ? "#C8A96E" : "#161616", color: n === page ? "#0c0c0c" : "#fff", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>{n}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return <Suspense fallback={<p style={{ color: "#666" }}>Loading…</p>}><Table /></Suspense>;
}
