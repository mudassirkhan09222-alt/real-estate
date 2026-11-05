"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Stats { total: number; published: number; draft: number; }

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats>({ total: 0, published: 0, draft: 0 });

  useEffect(() => {
    fetch("/api/admin/stats").then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  const statCards = [
    {
      label: "TOTAL PRODUCTS",
      value: stats.total,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </svg>
      ),
      iconBg: "#eff6ff",
      href: "/admin/products",
    },
    {
      label: "PUBLISHED",
      value: stats.published,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.8">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      ),
      iconBg: "#f0fdf4",
      href: "/admin/products?status=published",
    },
    {
      label: "DRAFT",
      value: stats.draft,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8">
          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      ),
      iconBg: "#fffbeb",
      href: "/admin/products?status=draft",
    },
  ];

  const actionCards = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
      ),
      iconBg: "#eff6ff",
      title: "Add a product",
      desc: "Create a new property or real estate listing.",
      href: "/admin/products/new",
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2">
          <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
        </svg>
      ),
      iconBg: "#f5f3ff",
      title: "Manage categories",
      desc: "Create and organise product categories.",
      href: "/admin/categories",
    },
  ];

  return (
    <div>
      <h1 style={{ color: "#0f172a", fontSize: 26, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
        Dashboard Overview
      </h1>
      <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 28px" }}>
        Manage properties and listings for the Warsi Real Estate website.
      </p>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 28 }}>
        {statCards.map(c => (
          <Link key={c.label} href={c.href} style={{ textDecoration: "none" }}>
            <div style={{
              background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
              padding: "20px 22px", display: "flex", alignItems: "center", gap: 16,
              transition: "box-shadow .15s",
            }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 10, background: c.iconBg,
                display: "grid", placeItems: "center", flexShrink: 0,
              }}>
                {c.icon}
              </div>
              <div>
                <p style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 4px" }}>
                  {c.label}
                </p>
                <p style={{ color: "#0f172a", fontSize: 28, fontWeight: 700, margin: 0, lineHeight: 1 }}>
                  {c.value}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Action cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
        {actionCards.map(c => (
          <Link key={c.href} href={c.href} style={{ textDecoration: "none" }}>
            <div style={{
              background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
              padding: "20px 22px", display: "flex", alignItems: "center", gap: 16,
              cursor: "pointer", transition: "box-shadow .15s",
            }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 10, background: c.iconBg,
                display: "grid", placeItems: "center", flexShrink: 0,
              }}>
                {c.icon}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#0f172a", fontSize: 15, fontWeight: 600, margin: "0 0 2px" }}>{c.title}</p>
                <p style={{ color: "#64748b", fontSize: 13, margin: 0 }}>{c.desc}</p>
              </div>
              <span style={{ color: "#94a3b8", fontSize: 20, flexShrink: 0 }}>→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
