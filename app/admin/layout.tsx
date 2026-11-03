"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/admin",                  icon: "⬡", label: "Overview"    },
  { href: "/admin/products",         icon: "🏠", label: "Properties"  },
  { href: "/admin/products/new",     icon: "＋", label: "Add Property" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  // Login page uses its own full-screen layout — no sidebar
  if (pathname === "/admin/login") return <>{children}</>;

  const W = collapsed ? 64 : 230;

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "system-ui,sans-serif", background: "#0c0c0c" }}>
      {/* ── Sidebar ── */}
      <aside style={{ width: W, background: "#111", borderRight: "1px solid #1e1e1e", display: "flex", flexDirection: "column", flexShrink: 0, transition: "width .2s", overflow: "hidden" }}>
        {/* Brand */}
        <div style={{ padding: "18px 14px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid #1e1e1e", minHeight: 68 }}>
          <Image src="/Real_state_Logo.png" alt="Logo" width={32} height={32} style={{ objectFit: "contain", flexShrink: 0 }} />
          {!collapsed && <span style={{ color: "#fff", fontWeight: 700, fontSize: 14, whiteSpace: "nowrap" }}>Warsi CMS</span>}
          <button onClick={() => setCollapsed(v => !v)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16, flexShrink: 0 }}>{collapsed ? "›" : "‹"}</button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "12px 8px" }}>
          {NAV.map(n => {
            const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 9, marginBottom: 3, background: active ? "#1c1c1c" : "transparent", color: active ? "#C8A96E" : "#777", textDecoration: "none", fontSize: 14, whiteSpace: "nowrap", transition: "background .15s" }}>
                <span style={{ fontSize: 17, flexShrink: 0 }}>{n.icon}</span>
                {!collapsed && n.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: "10px 8px", borderTop: "1px solid #1e1e1e" }}>
          <a href="/" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 9, color: "#666", textDecoration: "none", fontSize: 13, marginBottom: 2, whiteSpace: "nowrap" }}>
            <span>🌐</span>{!collapsed && " View Site"}
          </a>
          <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 12px", borderRadius: 9, background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 13, whiteSpace: "nowrap" }}>
            <span>⏻</span>{!collapsed && " Sign Out"}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{ flex: 1, overflow: "auto", padding: "36px 40px", color: "#fff" }}>
        {children}
      </main>
    </div>
  );
}
