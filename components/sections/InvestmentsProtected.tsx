"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { AnimatedDecoLine } from "@/components/ui/AnimatedDecoLine";

const mkVariants = (delay = 0): Variants => ({
  hidden: { opacity: 0, y: 40 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.85, delay } },
});
const VP = { once: true as const, margin: "-80px" as const };

const CARDS = [
  {
    num: "01",
    title: "Property\nDiscovery",
    img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80",
    alt: "Luxury villa exterior",
  },
  {
    num: "02",
    title: "Online\nViewing",
    img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
    alt: "Modern house architecture",
  },
  {
    num: null,          // center brand card — no number
    title: "Secure\nTransaction",
    img: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=600&q=80",
    alt: "Secure property handover keys",
    isCenter: true,
  },
  {
    num: "03",
    title: "Legal\nVerification",
    img: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=600&q=80",
    alt: "Modern interior living room",
  },
  {
    num: "04",
    title: "Title\nTransfer",
    img: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=600&q=80",
    alt: "City skyline aerial view",
  },
];

export function InvestmentsProtected() {
  return (
    <section
      id="how-it-works"
      className="overflow-hidden scroll-mt-16"
      style={{ backgroundColor: "#FAF6EF" }}
    >
      <div className="estatio-container py-20 md:py-28">

        {/* ── Heading ── */}
        <motion.div variants={mkVariants(0)} initial="hidden" whileInView="show" viewport={VP} className="mb-16 text-center">
          {/* Row 1: deco line + script "Investments" + deco line */}
          <div className="flex items-center justify-center gap-0">
            <AnimatedDecoLine delay={0.15} />
            <span
              className="px-6 leading-none text-[#1C1208]"
              style={{
                fontFamily: "var(--font-cormorant)",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "clamp(2.8rem, 7vw, 6rem)",
                letterSpacing: "0.01em",
              }}
            >
              Investments
            </span>
            <AnimatedDecoLine flip delay={0.15} />
          </div>

          {/* Row 2: PROTECTED with diamond-O */}
          <div className="flex items-center justify-center gap-0 mt-1">
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
              PR
              {/* Diamond O as seen in video */}
              <span className="relative inline-block" style={{ width: "0.6em" }}>
                <span style={{ opacity: 0 }}>O</span>
                <span className="absolute inset-0 flex items-center justify-center text-[#1C1208]">
                  ◈
                </span>
              </span>
              TECTED
            </span>
            <AnimatedDecoLine flip delay={0.15} />
          </div>
        </motion.div>

        {/* ── 5 arch cards ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-center gap-3 md:gap-4"
        >
          {CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: "easeOut" }}
              className="flex flex-col"
            >
              <ArchCard card={card} />
            </motion.div>
          ))}
        </motion.div>

        {/* ── Discover button ── */}
        <motion.div variants={mkVariants(0.3)} initial="hidden" whileInView="show" viewport={VP} className="mt-12 flex justify-center">
          <button className="pill-btn-dark" style={{ paddingInline: "48px", paddingBlock: "13px" }}>
            Discover
          </button>
        </motion.div>

      </div>
    </section>
  );
}

/* ─── Arch-shaped card ─────────────────── */
function ArchCard({ card }: { card: typeof CARDS[number] }) {
  const isCenter = (card as { isCenter?: boolean }).isCenter;

  return (
    <div
      className="relative flex flex-col overflow-hidden transition-transform duration-500 hover:-translate-y-2"
      style={{
        width: isCenter ? "clamp(130px,14vw,190px)" : "clamp(110px,12vw,165px)",
        height: isCenter ? "clamp(240px,28vw,370px)" : "clamp(200px,22vw,300px)",
        border: "1.5px solid rgba(28,18,8,0.2)",
        borderRadius: "999px 999px 18px 18px",
        background: "#FAF6EF",
        marginBottom: isCenter ? 0 : "clamp(16px,3vw,40px)",
      }}
    >
      {/* Number badge */}
      {card.num && (
        <span
          className="absolute top-3 left-0 right-0 text-center"
          style={{
            fontFamily: "var(--font-inter)",
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: "0.12em",
            color: "rgba(28,18,8,0.45)",
          }}
        >
          {card.num}
        </span>
      )}

      {/* Photo or ES monogram */}
      {card.img ? (
        <div
          className="relative overflow-hidden"
          style={{
            flex: "0 0 55%",
            borderRadius: "999px 999px 0 0",
          }}
        >
          <Image
            src={card.img}
            alt={card.alt}
            fill
            className="object-cover"
            sizes="180px"
          />
        </div>
      ) : (
        <div
          className="flex items-center justify-center"
          style={{ flex: "0 0 55%", borderRadius: "999px 999px 0 0" }}
        >
          <span
            className="text-[#1C1208]"
            style={{
              fontFamily: "var(--font-cormorant)",
              fontWeight: 400,
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              letterSpacing: "0.08em",
            }}
          >
            ES
          </span>
        </div>
      )}

      {/* Label */}
      <div
        className="flex flex-1 flex-col items-center justify-center px-3 text-center"
      >
        <p
          className="whitespace-pre-line text-[#1C1208]"
          style={{
            fontFamily: "var(--font-cormorant)",
            fontWeight: 500,
            fontSize: "clamp(0.9rem, 1.6vw, 1.2rem)",
            lineHeight: 1.25,
          }}
        >
          {card.title}
        </p>
        {isCenter && (
          <p
            className="mt-2"
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: "0.18em",
              color: "rgba(28,18,8,0.45)",
              textTransform: "uppercase",
            }}
          >
            ACCESS VERIFIED{"\n"}PREMIUM PROPERTIES
          </p>
        )}
      </div>
    </div>
  );
}



