"use client";

import { motion } from "framer-motion";
import { AnimatedDecoLine } from "@/components/ui/AnimatedDecoLine";

/**
 * Full-width dark banner section — exact frame 10.
 * Dark #1C1208 background, white script + serif "YIELD FORECAST" centered,
 * deco lines, subtext, cream "Explore" oval button.
 */
export function YieldForecastBanner() {
  return (
    <section
      id="yield-banner"
      className="relative overflow-hidden scroll-mt-16"
      style={{ backgroundColor: "#1C1208" }}
    >
      <div className="estatio-container py-20 md:py-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          {/* Script "Yield" */}
          <div className="flex items-center justify-center gap-0">
            <AnimatedDecoLine color="#FAF6EF" opacity={0.3} delay={0.2} />
            <span
              className="px-6 leading-none text-[#FAF6EF]"
              style={{
                fontFamily: "var(--font-cormorant)",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "clamp(3rem, 8vw, 7rem)",
              }}
            >
              Yield
            </span>
            <AnimatedDecoLine flip color="#FAF6EF" opacity={0.3} delay={0.2} />
          </div>

          {/* FORECAST */}
          <div className="flex items-center justify-center gap-0 -mt-2">
            <AnimatedDecoLine color="#FAF6EF" opacity={0.3} delay={0.2} />
            <span
              className="px-6 leading-none text-[#FAF6EF]"
              style={{
                fontFamily: "var(--font-cormorant)",
                fontWeight: 700,
                fontSize: "clamp(3rem, 8vw, 7rem)",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
              }}
            >
              FORECAST
            </span>
            <AnimatedDecoLine flip color="#FAF6EF" opacity={0.3} delay={0.2} />
          </div>

          {/* Subtext */}
          <p
            className="mt-8 mx-auto max-w-md"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(250,246,239,0.45)",
              lineHeight: 1.8,
            }}
          >
            ESTIMATE RENTAL INCOME, CAPITAL GROWTH, AND TOTAL
            RETURNS ACROSS DUBAI, BALI, AND CYPRUS.
          </p>

          {/* Explore button */}
          <div className="mt-10 flex justify-center">
            <a href="#forecast" className="pill-btn-cream" style={{ paddingInline: "52px", paddingBlock: "14px" }}>
              Explore
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}



