"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

/* ── Instagram SVG ── */
const InstagramSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

const NAV_LINKS = [
  { label: "PROPERTIES", href: "#properties" },
  { label: "HOW IT WORKS", href: "#how-it-works" },
  { label: "SERVICES", href: "#services" },
  { label: "TERMS", href: "#terms" },
  { label: "CONTACT", href: "#contact" },
];

export function Navbar({ forceSolid = false }: { forceSolid?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const solid = forceSolid || scrolled || open;

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-all duration-500"
      style={{
        background: "transparent",
        backdropFilter: "none",
        WebkitBackdropFilter: "none",
        borderBottom: "none",
      }}
    >
      <nav className="estatio-container flex h-18 min-h-[68px] items-center justify-between gap-4">

        {/* ── Logo only (name is inside the logo image) ── */}
        <Link href="/" className="shrink-0">
          <div className="relative h-20 w-44 overflow-hidden">
            <Image
              src="/Real_state_Logo.png"
              alt="Warsi Jee Construction Company"
              fill
              className="object-contain object-left"
              sizes="176px"
            />
          </div>
        </Link>

        {/* ── Desktop nav links — each in a cream pill box ── */}
        <div className="hidden items-center gap-3 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-5 py-2 text-[12px] font-bold tracking-[0.12em] transition-all duration-200 hover:opacity-80"
              style={{
                background: "#FAF6EF",
                color: "#1C1208",
                fontFamily: "var(--font-inter)",
                letterSpacing: "0.1em",
                boxShadow: "0 1px 4px rgba(28,18,8,0.10)",
              }}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* ── Instagram + CTA ── */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#"
            aria-label="Instagram"
            className="grid h-9 w-9 place-items-center rounded-full transition-opacity hover:opacity-70"
            style={{ background: "#FAF6EF", color: "#1C1208", boxShadow: "0 1px 4px rgba(28,18,8,0.10)" }}
          >
            <InstagramSVG />
          </a>
          <a
            href="#contact"
            className="rounded-full px-5 py-2 text-[12px] font-bold tracking-[0.1em] transition-all hover:opacity-80"
            style={{ background: "#FAF6EF", color: "#1C1208", fontFamily: "var(--font-inter)" }}
          >
            CONTACT US
          </a>
        </div>

        {/* ── Mobile hamburger ── */}
        <button
          type="button"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-col gap-1.5 p-2 md:hidden"
        >
          <span className={`block h-px w-6 bg-white transition-all duration-300 ${open ? "translate-y-[5px] rotate-45" : ""}`} />
          <span className={`block h-px w-6 bg-white transition-all duration-300 ${open ? "opacity-0" : ""}`} />
          <span className={`block h-px w-6 bg-white transition-all duration-300 ${open ? "-translate-y-[5px] -rotate-45" : ""}`} />
        </button>
      </nav>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-white/10 bg-[#1C1208]/97 backdrop-blur-md md:hidden"
          >
            <div className="estatio-container flex flex-col gap-1 py-4">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm tracking-widest text-white/70 hover:bg-white/5 hover:text-white"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-white/10 px-4 py-3 text-center text-sm tracking-widest text-white"
              >
                CONTACT US
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
