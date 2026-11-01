"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import clsx from "clsx";
import { Building2, LayoutDashboard, Loader2, LogOut, PlusCircle, ExternalLink } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/properties", label: "Properties", icon: Building2 },
  { href: "/admin/properties/new", label: "New listing", icon: PlusCircle },
];

/**
 * Client-side gate + nav shell for the admin CMS. Checks the session via /api/me,
 * redirects to /admin/login when unauthenticated, and enforces mutations server-side
 * in the route handlers regardless of UI state.
 */
export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<"loading" | "authed" | "unauthed">("loading");

  useEffect(() => {
    let active = true;
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { authed?: boolean }) => active && setStatus(d.authed ? "authed" : "unauthed"))
      .catch(() => active && setStatus("unauthed"));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (status === "unauthed") router.replace("/admin/login");
  }, [status, router]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  if (status !== "authed") {
    return (
      <div className="grid min-h-screen place-items-center bg-cream-50">
        <Loader2 className="animate-spin text-espresso-400" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="sticky top-0 z-40 border-b border-espresso-900/8 bg-cream-50/90 backdrop-blur-md">
        <div className="container-luxe flex h-16 items-center justify-between gap-4">
          <Link href="/admin" className="font-serif text-lg tracking-wide text-espresso-900">
            MERIDIAN <span className="text-gold-600">RESERVE</span> <span className="text-xs align-middle text-muted">/ Admin</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1 sm:gap-2">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={clsx(
                    "inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors sm:px-4",
                    active ? "bg-espresso-900 text-cream-50" : "text-espresso-700 hover:bg-cream-100",
                  )}
                >
                  <Icon size={15} /> <span className="hidden sm:inline">{n.label}</span>
                </Link>
              );
            })}
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-muted transition-colors hover:bg-cream-100 sm:px-4"
            >
              <ExternalLink size={15} /> <span className="hidden sm:inline">View site</span>
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm text-espresso-700 transition-colors hover:bg-cream-100 sm:px-4"
            >
              <LogOut size={15} /> <span className="hidden sm:inline">Sign out</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="container-luxe py-8 lg:py-12">{children}</main>
    </div>
  );
}
