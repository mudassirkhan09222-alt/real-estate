"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats { total: number; published: number; draft: number; }

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats>({ total: 0, published: 0, draft: 0 });
  const [email, setEmail] = useState("");

  useEffect(() => {
    fetch("/api/admin/stats").then(r => r.json()).then(setStats).catch(() => {});
    fetch("/api/admin/me").then(r => r.json()).then(d => setEmail(d.email ?? "")).catch(() => {});
  }, []);

  const cards = [
    { label: "Total Properties", value: stats.total,     color: "#C8A96E", icon: "🏠", href: "/admin/products" },
    { label: "Published",        value: stats.published,  color: "#4ade80", icon: "✅", href: "/admin/products?status=published" },
    { label: "Drafts",           value: stats.draft,      color: "#facc15", icon: "📝", href: "/admin/products?status=draft" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ color: "#555", fontSize: 13, margin: "0 0 4px" }}>{email}</p>
        <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: 0 }}>Dashboard</h1>
        <p style={{ color: "#666", fontSize: 14, marginTop: 4 }}>Welcome to Warsi Real Estate CMS</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 18, marginBottom: 36 }}>
        {cards.map(c => (
          <Link key={c.label} href={c.href} style={{ background: "#161616", border: "1px solid #232323", borderRadius: 14, padding: "22px 20px", textDecoration: "none", display: "block" }}>
            <div style={{ fontSize: 26, marginBottom: 14 }}>{c.icon}</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: c.color, lineHeight: 1 }}>{c.value}</div>
            <div style={{ color: "#666", fontSize: 13, marginTop: 6 }}>{c.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <h2 style={{ color: "#888", fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>Quick Actions</h2>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/admin/products/new" style={Btn("#C8A96E","#0c0c0c")}>＋ Add Property</Link>
        <Link href="/admin/products"     style={Btn("#161616","#C8A96E")}>📋 All Properties</Link>
      </div>
    </div>
  );
}

const Btn = (bg: string, color: string): React.CSSProperties => ({
  background: bg, color, border: `1px solid ${color}30`, borderRadius: 10,
  padding: "11px 22px", textDecoration: "none", fontSize: 14, fontWeight: 600,
});
