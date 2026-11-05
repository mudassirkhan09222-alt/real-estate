"use client";
import { useEffect, useState, FormEvent } from "react";

interface Category { id: string; name: string; }

export default function CategoriesPage() {
  const [cats,    setCats]    = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  async function load() {
    const d = await fetch("/api/categories").then(r => r.json());
    setCats(Array.isArray(d) ? d : []);
  }
  useEffect(() => { load(); }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true); setError("");
    const r = await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName.trim() }) });
    const d = await r.json();
    if (!r.ok) setError(d.error ?? "Failed");
    else { setNewName(""); load(); }
    setLoading(false);
  }

  async function del(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    await fetch("/api/categories", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ color: "#0f172a", fontSize: 26, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.02em" }}>Categories</h1>
      <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 24px" }}>Organise your property listings by category.</p>

      {/* Add form */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "20px 22px", marginBottom: 20 }}>
        <p style={{ color: "#475569", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 14px" }}>Add New Category</p>
        <form onSubmit={add} style={{ display: "flex", gap: 10 }}>
          <input
            value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="Category name…"
            style={{ flex: 1, background: "#fff", border: "1px solid #d1d5db", borderRadius: 8, padding: "9px 14px", color: "#0f172a", fontSize: 14, outline: "none" }}
          />
          <button type="submit" disabled={loading} style={{
            background: "#1e2a3b", color: "#fff", border: "none", borderRadius: 8,
            padding: "9px 22px", fontWeight: 600, fontSize: 14, cursor: "pointer", opacity: loading ? 0.7 : 1,
          }}>
            {loading ? "Adding…" : "Add"}
          </button>
        </form>
        {error && <p style={{ color: "#dc2626", fontSize: 13, margin: "10px 0 0" }}>{error}</p>}
      </div>

      {/* List */}
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
        {cats.length === 0 ? (
          <p style={{ color: "#94a3b8", textAlign: "center", padding: "40px 20px", fontSize: 14 }}>No categories yet. Add the first one above.</p>
        ) : (
          cats.map((c, i) => (
            <div key={c.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "13px 20px",
              borderBottom: i < cats.length - 1 ? "1px solid #f1f5f9" : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f1f5f9", display: "grid", placeItems: "center" }}>
                  <span style={{ fontSize: 15 }}>⊟</span>
                </div>
                <div>
                  <span style={{ color: "#0f172a", fontSize: 14, fontWeight: 600 }}>{c.name}</span>
                  <span style={{ color: "#94a3b8", fontSize: 12, marginLeft: 8 }}>#{c.id}</span>
                </div>
              </div>
              <button onClick={() => del(c.id, c.name)} style={{
                background: "#fff5f5", color: "#dc2626", border: "1px solid #fecaca",
                borderRadius: 7, padding: "6px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600,
              }}>Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
