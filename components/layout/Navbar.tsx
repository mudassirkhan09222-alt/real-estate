"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import clsx from "clsx";

const NAV_LINKS = [
  { label: "Properties", href: "#properties" },
  { label: "Protected", href: "#protected" },
  { label: "Yield Forecast", href: "#forecast" },
  { label: "Access", href: "#access" },
];

/**
 * Fixed navbar. It is rendered inside the HeroSection container (so it visually
 * belongs to the hero), but uses position:fixed so it stays pinned across the
 * whole page. It starts transparent over the dark hero and blends to a solid
 * cream bar once the user scrolls — matching the reference transition.
 */
export function Navbar({ forceSolid = false }: { forceSolid?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = forceSolid || scrolled || open;

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        solid
          ? "bg-cream-50/90 backdrop-blur-md shadow-[0_1px_0_0_rgba(28,22,18,0.08)]"
          : "bg-transparent",
      )}
    >
      <nav className="container-luxe flex h-20 items-center justify-between">
        <Link
          href="/"
          className="font-serif text-xl tracking-[0.04em] transition-colors duration-300"
          style={{ color: solid ? "#1c1612" : "#faf7f2" }}
        >
          MERIDIAN <span className="text-gold-500">RESERVE</span>
        </Link>

        <div className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={clsx(
                "relative text-sm transition-colors duration-300 after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-gold-500 after:transition-all hover:after:w-full",
                solid ? "text-espresso-700 hover:text-espresso-900" : "text-cream-100/80 hover:text-cream-50",
              )}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#access"
            className="rounded-full border border-gold-500 px-5 py-2 text-sm font-medium text-gold-600 transition-colors duration-300 hover:bg-gold-500 hover:text-cream-50"
          >
            Get Access
          </a>
        </div>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={clsx("md:hidden transition-colors", solid ? "text-espresso-900" : "text-cream-50")}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-espresso-900/5 bg-cream-50 md:hidden"
          >
            <div className="container-luxe flex flex-col gap-1 py-4">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm text-espresso-700 hover:bg-cream-100"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#access"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-gold-500 px-5 py-3 text-center text-sm font-medium text-cream-50"
              >
                Get Access
              </a>
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm text-muted hover:bg-cream-100"
              >
                Admin
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
