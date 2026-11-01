"use client";

import { useRef, type FormEvent } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight, Search } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { CitySkyline } from "@/components/ui/CitySkyline";
import { PROPERTY_TYPES, REGIONS } from "@/lib/types";

/**
 * Full-viewport hero. The fixed Navbar is rendered here (inside the hero
 * container, per the brief) and the skyline drifts on a parallax layer as the
 * user scrolls. The search bar dispatches a `property-filter` CustomEvent that
 * the PropertyGrid listens for, then scrolls down to the grid — keeping the two
 * components decoupled while sharing one filter state.
 */
const STATS = [
  { value: "120+", label: "Vetted holdings" },
  { value: "6", label: "Curated regions" },
  { value: "5.4%", label: "Avg. forecast yield" },
];

export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "22%"]);
  const ySky = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "14%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.75], [0, reduce ? 0 : -40]);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const detail = {
      region: String(fd.get("region") ?? "all"),
      type: String(fd.get("type") ?? "all"),
      search: String(fd.get("search") ?? ""),
    };
    window.dispatchEvent(new CustomEvent("property-filter", { detail }));
    document.getElementById("properties")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden bg-espresso-950">
      {/* Warm horizon gradient */}
      <motion.div style={{ y: yBg }} className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,#2a211b_0%,#1c1612_45%,#120d0a_100%)]" />
      </motion.div>

      {/* Parallax skyline near the base */}
      <motion.div
        style={{ y: ySky }}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] opacity-90"
      >
        <CitySkyline />
      </motion.div>

      {/* Bottom fade into the page */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-cream-50 to-transparent" />

      <Navbar />

      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="container-luxe relative z-10 flex min-h-[100svh] flex-col justify-center pb-28 pt-32"
      >
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-cream-200/15 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.28em] text-cream-200/80"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
          International property investments
        </motion.span>

        <h1 className="font-serif text-cream-50 leading-[0.95]">
          {["INVEST", "INTERNATIONALLY", "TODAY"].map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="block text-[2.75rem] sm:text-6xl md:text-7xl lg:text-[5.5rem]"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-7 max-w-xl text-base leading-relaxed text-cream-200/70"
        >
          Access vetted, investment-grade real estate across curated regions —
          with transparent yield forecasts and protected tenure on every holding.
        </motion.p>

        {/* Search filters */}
        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-3 rounded-2xl border border-cream-200/12 bg-espresso-900/50 p-3 backdrop-blur-md sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_auto]"
        >
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cream-200/50" />
            <input
              name="search"
              type="search"
              placeholder="Search by title or location…"
              className="w-full rounded-xl border border-cream-200/10 bg-espresso-950/40 px-11 py-3 text-sm text-cream-50 outline-none transition-colors placeholder:text-cream-200/40 focus:border-gold-500"
            />
          </div>
          <select
            name="region"
            defaultValue="all"
            className="rounded-xl border border-cream-200/10 bg-espresso-950/40 px-4 py-3 text-sm text-cream-50 outline-none transition-colors focus:border-gold-500"
          >
            <option value="all" className="bg-espresso-900">All regions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r} className="bg-espresso-900">{r}</option>
            ))}
          </select>
          <select
            name="type"
            defaultValue="all"
            className="rounded-xl border border-cream-200/10 bg-espresso-950/40 px-4 py-3 text-sm text-cream-50 outline-none transition-colors focus:border-gold-500"
          >
            <option value="all" className="bg-espresso-900">All types</option>
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t} className="bg-espresso-900">{t}</option>
            ))}
          </select>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-6 py-3 text-sm font-medium text-espresso-950 transition-colors hover:bg-gold-400"
          >
            Search <ArrowRight size={16} />
          </button>
        </motion.form>

        {/* Stat strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.85 }}
          className="mt-12 flex flex-wrap gap-x-12 gap-y-6"
        >
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-serif text-3xl text-cream-50">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-cream-200/50">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
