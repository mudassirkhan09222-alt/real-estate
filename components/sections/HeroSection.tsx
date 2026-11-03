"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

const BUDGETS = [
  "PKR 50 Lakh – 1 Crore",
  "PKR 1 Crore – 3 Crore",
  "PKR 3 Crore – 5 Crore",
  "PKR 5 Crore – 10 Crore",
  "PKR 10 Crore+",
];
const GOALS = [
  "Rental Income", "Sale / Purchase", "Property Transfer", "Lease / Rent", "Investment",
];
const COUNTRIES = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Hyderabad", "Quetta", "Peshawar",
];

/**
 * Hero section — exact replica of video frame 2:
 * - Full-viewport Dubai skyline photo (Unsplash aerial night shot)
 * - Centered giant Cormorant Garamond serif: INVEST / INTERNATIONALLY / TODAY
 * - Dark semi-transparent glassmorphism filter bar: Country | Budget | Investment Goal
 * - Cream oval "Explore Properties" button
 * - Parallax on scroll
 */
export function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "25%"]);
  const contentY = useTransform(scrollYProgress, [0, 0.8], [0, reduce ? 0 : -50]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const onExplore = () => {
    document.getElementById("properties")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      ref={ref}
      className="relative h-screen min-h-[600px] overflow-hidden"
      aria-label="Hero — Invest Internationally Today"
    >
      {/* ── Dubai skyline background ── */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 scale-[1.12]">
        <Image
          src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2070&q=90"
          alt="Dubai skyline at dusk"
          fill
          className="object-cover object-center"
          preload
          sizes="100vw"
        />
        {/* Dark overlay — matches video's moody blue-brown tint */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
      </motion.div>

      {/* ── Navbar lives inside hero ── */}
      <Navbar />

      {/* ── Main content ── */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 flex h-full flex-col items-center justify-center px-4 pb-28 pt-40 text-center"
      >
        {/* Giant heading */}
        <div className="select-none">
          {["INVEST", "INTERNATIONALLY", "TODAY"].map((word, i) => (
            <motion.div
              key={word}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 + i * 0.15, ease: "easeOut" }}
              className="block leading-none text-white"
              style={{
                fontFamily: "var(--font-cormorant)",
                fontWeight: 400,
                fontStyle: i === 1 ? "italic" : "normal",
                fontSize: "clamp(3.5rem, 11vw, 9rem)",
                letterSpacing: "0.01em",
              }}
            >
              {word}
            </motion.div>
          ))}
        </div>

        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75 }}
          className="mt-10 w-full max-w-2xl overflow-hidden rounded-xl"
          style={{ background: "rgba(28,18,8,0.72)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <FilterCol label="CITY" defaultValue="Karachi" options={COUNTRIES} />
            <FilterCol label="BUDGET" defaultValue="PKR 1 Crore – 3 Crore" options={BUDGETS} />
            <FilterCol label="INVESTMENT GOAL" defaultValue="Rental Income" options={GOALS} />
          </div>
        </motion.div>

        {/* CTA button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1 }}
          onClick={onExplore}
          className="pill-btn-cream mt-7"
          style={{ paddingInline: "52px", paddingBlock: "14px" }}
        >
          Explore Properties
        </motion.button>
      </motion.div>

      {/* ── Scroll cue ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        >
          <ChevronDown size={22} className="text-white/50" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─────────────────────────────────────────── */
function FilterCol({
  label,
  defaultValue,
  options,
}: {
  label: string;
  defaultValue: string;
  options: string[];
}) {
  return (
    <div className="relative px-5 py-4">
      <p className="text-[10px] font-medium tracking-[0.2em] text-white/50">{label}</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <select
          defaultValue={defaultValue}
          className="w-full bg-transparent text-[15px] font-light text-white outline-none cursor-pointer appearance-none"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          {options.map((o) => (
            <option key={o} value={o} className="bg-[#1C1208] text-white">
              {o}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="shrink-0 text-white/50" />
      </div>
    </div>
  );
}
