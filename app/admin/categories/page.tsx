"use client";
import { useEffect, useState, FormEvent } from "react";

interface Category { id: string; name: string; }

export default function CategoriesPage() {
  const [cats, setCats] = useState<Category[]>([]);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const d = await fetch("/api/categories").then(r => r.json());
    setCats(Array.isArray(d) ? d : []);
  }
  useEffect(() => { load(); }, []);

  async function add(e: FormEvent) {
    e.preventDefault(); if (!newName.trim()) return;
    setLoading(true); setError("");
    const r = await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newName.trim() }) });
    const d = await r.json();
    if (!r.ok) setError(d.error ?? "Failed");
    else { setNewName(""); load(); }
    setLoading(false);
  }

  async function del(id: string, name: string) {
    if (!confirm(`Delete category "${name}"?`)) return;
    await fetch("/api/categories", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <h1 style={{ color: "#fff", fontSize: 26, fontWeight: 800, margin: "0 0 24px" }}>Categories</h1>

      {/* Add form */}
      <form onSubmit={add} style={{ display: "flex", gap: 12, marginBottom: 28 }}>
        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Category name…" style={{ flex: 1, background: "#111", border: "1px solid #333", borderRadius: 8, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none" }} />
        <button type="submit" disabled={loading} style={{ background: "#C8A96E", color: "#0f0f0f", border: "none", borderRadius: 8, padding: "11px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          {loading ? "Adding…" : "Add"}
        </button>
      </form>
      {error && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{error}</p>}

      {/* List */}
      <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, overflow: "hidden" }}>
        {cats.length === 0 ? (
          <p style={{ color: "#888", padding: "32px 20px", textAlign: "center" }}>No categories yet.</p>
        ) : cats.map((c, i) => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: i < cats.length - 1 ? "1px solid #1a1a1a" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ background: "#1e1e1e", color: "#888", borderRadius: 6, padding: "3px 10px", fontSize: 12 }}>#{c.id}</span>
              <span style={{ color: "#fff", fontWeight: 600 }}>{c.name}</span>
            </div>
            <button onClick={() => del(c.id, c.name)} style={{ background: "transparent", color: "#f87171", border: "1px solid #f8717140", borderRadius: 7, padding: "6px 14px", cursor: "pointer", fontSize: 13 }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
