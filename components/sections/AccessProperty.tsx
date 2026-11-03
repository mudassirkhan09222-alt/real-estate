"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { AnimatedDecoLine } from "@/components/ui/AnimatedDecoLine";

// framer-motion v14 requires typed transition — use Variants pattern
const mkVariants = (delay = 0): Variants => ({
  hidden: { opacity: 0, y: 40 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.85, delay } },
});
const VP = { once: true as const, margin: "-80px" as const };

/**
 * "Access International Property" — exact video frame 4/5 replica.
 *
 * Layout:
 *   Full-width centered heading block (script + serif + decorative)
 *   Below: 2-col — large image left, (2 stacked images + copy) right
 *
 * Typography exactly as video:
 *   Row 1 — script italic "Access" (Cormorant italic) + pill "VIP"
 *   Row 2 — bold uppercase "INTERNATIONAL" + dot-line decorators
 *   Row 3 — pill "LUX" + bold decorative "PROPERTY" (Cormorant with stylistic alt O)
 */
export function AccessProperty() {
  return (
    <section
      id="properties"
      className="scroll-mt-16 overflow-hidden"
      style={{ backgroundColor: "#FAF6EF" }}
    >
      <div className="estatio-container py-20 md:py-28">

        {/* ── Heading block ── */}
        <motion.div
          variants={mkVariants(0)} initial="hidden" whileInView="show" viewport={VP}
          className="mb-14 text-center"
        >
          {/* Row 1: script "Access" + VIP badge */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span
              className="leading-none text-[#1C1208]"
              style={{
                fontFamily: "var(--font-cormorant)",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "clamp(2.8rem, 7vw, 6rem)",
                letterSpacing: "0.01em",
              }}
            >
              Access
            </span>
            <span className="pill-badge" style={{ marginTop: "0.5rem" }}>VIP</span>
          </div>

          {/* Row 2: INTERNATIONAL with deco lines */}
          <div className="relative flex items-center justify-center gap-0 mt-1">
            {/* Left line + dot */}
            <AnimatedDecoLine delay={0.15} />

            <span
              className="px-6 leading-none text-[#1C1208]"
              style={{
                fontFamily: "var(--font-cormorant)",
                fontWeight: 700,
                fontSize: "clamp(2.8rem, 7vw, 6rem)",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
              }}
            >
              INTERNATIONAL
            </span>

            {/* Right line + dot */}
            <AnimatedDecoLine flip delay={0.15} />
          </div>

          {/* Row 3: LUX + PROPERTY */}
          <div className="flex items-center justify-center gap-4 mt-1 flex-wrap">
            <span className="pill-badge" style={{ marginTop: "0.3rem" }}>LUX</span>
            <span
              className="leading-none text-[#1C1208]"
              style={{
                fontFamily: "var(--font-cormorant)",
                fontWeight: 700,
                fontSize: "clamp(2.8rem, 7vw, 6rem)",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
              }}
            >
              PROPERT
              {/* Decorative diamond-O as in the video */}
              <span className="relative inline-block">
                <span style={{ opacity: 0 }}>Y</span>
                <span
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    fontFamily: "var(--font-cormorant)",
                    fontWeight: 700,
                    fontStyle: "normal",
                  }}
                >
                  ♦
                </span>
              </span>
              Y
            </span>
          </div>
        </motion.div>

        {/* ── Image + copy block ── */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.15fr_1fr] md:items-start">

          {/* Large left image — Bali temple */}
          <motion.div
            variants={mkVariants(0.05)} initial="hidden" whileInView="show" viewport={VP}
            className="relative overflow-hidden rounded-2xl"
            style={{ aspectRatio: "4/3" }}
          >
            <Image
              src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=85"
              alt="Bali temple reflection"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 55vw"
            />
          </motion.div>

          {/* Right column: 2 stacked images + text */}
          <div className="flex flex-col gap-4">
            {/* Two stacked small images */}
            <motion.div variants={mkVariants(0.1)} initial="hidden" whileInView="show" viewport={VP} className="grid grid-cols-2 gap-4">
              {/* Woman sitting */}
              <div className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: "3/4" }}>
                <Image
                  src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80"
                  alt="Investor relaxing"
                  fill
                  className="object-cover object-top"
                  sizes="25vw"
                />
              </div>
              {/* Architecture / columns */}
              <div className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: "3/4" }}>
                <Image
                  src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80"
                  alt="Luxury property architecture"
                  fill
                  className="object-cover"
                  sizes="25vw"
                />
              </div>
            </motion.div>

            {/* Description text + link */}
            <motion.div variants={mkVariants(0.15)} initial="hidden" whileInView="show" viewport={VP} className="pt-2">
              <p
                className="text-[12px] font-medium uppercase tracking-[0.22em] leading-relaxed"
                style={{ color: "#7A6652" }}
              >
                ACCESS VERIFIED PREMIUM PROPERTIES ACROSS INTERNATIONAL MARKETS.
                ESTATIO COMBINES TRANSPARENT FINANCIAL PROJECTIONS, LEGAL SUPPORT,
                AND SECURED TRANSACTIONS.
              </p>
              <a
                href="#properties"
                className="mt-5 inline-flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.22em] text-[#1C1208] transition-opacity hover:opacity-60"
              >
                EXPLORE PROPERTIES
                <span className="block h-px w-8 bg-[#1C1208]" />
              </a>
            </motion.div>
          </div>
        </div>

      </div>
    </section>
  );
}



