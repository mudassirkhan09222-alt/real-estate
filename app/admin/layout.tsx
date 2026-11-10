"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

const NAV = [
  { href: "/admin",              icon: "⊞",  label: "Overview"     },
  { href: "/admin/products",     icon: "📦", label: "Products"     },
  { href: "/admin/products/new", icon: "+",  label: "Add Product"  },
  { href: "/admin/categories",   icon: "⊟",  label: "Categories"   },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  if (pathname === "/admin/login") return <>{children}</>;

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  const W = collapsed ? 68 : 220;

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      fontFamily: "'Inter',system-ui,sans-serif",
      background: "#f1f5f9",
    }}>
      {/* ── Sidebar ── */}
      <aside style={{
        width: W, flexShrink: 0,
        background: "#1e2a3b",
        display: "flex", flexDirection: "column",
        transition: "width .22s cubic-bezier(.4,0,.2,1)",
        overflow: "hidden",
        position: "sticky", top: 0, height: "100vh",
      }}>
        {/* Brand */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "20px 16px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          minHeight: 72,
        }}>
          <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
            <Image src="/Real 2.png" alt="Logo" fill style={{ objectFit: "contain" }} sizes="36px" />
          </div>
          {!collapsed && (
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", letterSpacing: "0.01em" }}>
              Warsi CMS
            </span>
          )}
          <button
            onClick={() => setCollapsed(v => !v)}
            style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(255,255,255,0.45)", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: 4, flexShrink: 0 }}
            aria-label="Toggle sidebar"
          >
            {collapsed ? "›" : "‹"}
          </button>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: "12px 8px" }}>
          {NAV.map(n => {
            const active = n.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} style={{
                display: "flex", alignItems: "center", gap: 11,
                padding: "9px 12px", borderRadius: 8, marginBottom: 2,
                background: active ? "rgba(255,255,255,0.12)" : "transparent",
                color: active ? "#fff" : "rgba(255,255,255,0.6)",
                textDecoration: "none", fontSize: 14, fontWeight: active ? 600 : 400,
                whiteSpace: "nowrap", transition: "background .15s, color .15s",
              }}>
                <span style={{ fontSize: 16, flexShrink: 0, width: 20, textAlign: "center" }}>{n.icon}</span>
                {!collapsed && n.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: "10px 8px 16px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <a href="/" target="_blank" rel="noreferrer" style={{
            display: "flex", alignItems: "center", gap: 11, padding: "9px 12px",
            borderRadius: 8, color: "rgba(255,255,255,0.55)", textDecoration: "none",
            fontSize: 13, marginBottom: 2, whiteSpace: "nowrap",
          }}>
            <span style={{ fontSize: 15, flexShrink: 0, width: 20, textAlign: "center" }}>↗</span>
            {!collapsed && "View Website"}
          </a>
          <button onClick={logout} style={{
            display: "flex", alignItems: "center", gap: 11, width: "100%",
            padding: "9px 12px", borderRadius: 8,
            background: "none", border: "none",
            color: "rgba(255,255,255,0.55)", cursor: "pointer",
            fontSize: 13, whiteSpace: "nowrap",
          }}>
            <span style={{ fontSize: 15, flexShrink: 0, width: 20, textAlign: "center" }}>⏻</span>
            {!collapsed && "Sign out"}
          </button>

          {!collapsed && (
            <p style={{
              color: "rgba(255,255,255,0.3)", fontSize: 11,
              margin: "12px 12px 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
            }}>mudassirkhan09222@gmail.com</p>
          )}
        </div>
      </aside>

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <header style={{
          background: "#fff", borderBottom: "1px solid #e2e8f0",
          padding: "0 32px", height: 56,
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          flexShrink: 0,
        }}>
          <span style={{ color: "#64748b", fontSize: 13 }}>
            Signed in as{" "}
            <strong style={{ color: "#1e293b", fontWeight: 600 }}>warsijeeconstructioncompany@gmail.com</strong>
          </span>
        </header>

        <main style={{ flex: 1, overflow: "auto", padding: "32px 36px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
