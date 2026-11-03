"use client";

import { motion } from "framer-motion";

/**
 * Terms & Conditions — standalone section placed before Footer.
 * Cream background, same design language as the rest of the site.
 */
const TERMS = [
  {
    badge: null,
    title: "Commission",
    items: [
      "2.5% Commission from Seller",
      "2.5% Commission from Purchaser",
    ],
  },
  {
    badge: "Sale / Purchase",
    title: "On Sale / Purchase",
    items: [
      "50% at Time of Agreement",
      "50% at Time of Possession",
    ],
  },
  {
    badge: "Owner / Rental",
    title: "Owner / Rental",
    items: [
      "50% at Time of Agreement",
      "50% at Time of Possession",
    ],
  },
];

const LEGAL_DOCS = [
  "Sale / Purchase & Rent Agreement",
  "Transfer of Property Deeds (Sale / Gifted)",
  "Attestation of Documents Verification",
  "Affidavite",
  "CTC / Search Certificate",
  "Duplicate File Collection",
];

export function TermsConditions() {
  return (
    <section
      id="terms"
      className="scroll-mt-20"
      style={{ backgroundColor: "#FAF6EF", borderTop: "1px solid rgba(28,18,8,0.08)" }}
    >
      <div className="estatio-container py-16 md:py-20">

        {/* ── Heading ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7 }}
          className="mb-10"
        >
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(28,18,8,0.4)",
              marginBottom: "0.6rem",
            }}
          >
            Legal
          </p>
          <h2
            style={{
              fontFamily: "var(--font-cormorant)",
              fontWeight: 700,
              fontSize: "clamp(2rem, 4vw, 3rem)",
              color: "#1C1208",
              letterSpacing: "0.02em",
            }}
          >
            Terms &amp; Conditions
          </h2>
        </motion.div>

        {/* ── 3 term cards ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-10">
          {TERMS.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="rounded-2xl p-5"
              style={{
                background: "#fff",
                border: "1px solid rgba(28,18,8,0.1)",
              }}
            >
              {t.badge && (
                <span
                  className="mb-3 inline-block rounded-full px-3 py-1 text-[10px] font-semibold tracking-wider text-white"
                  style={{
                    background: "#1C1208",
                    fontFamily: "var(--font-inter)",
                    letterSpacing: "0.14em",
                  }}
                >
                  {t.badge}
                </span>
              )}
              <p
                className="mb-3 text-[#1C1208]"
                style={{
                  fontFamily: "var(--font-cormorant)",
                  fontWeight: 600,
                  fontSize: "1.15rem",
                }}
              >
                {t.title}
              </p>
              <ul className="space-y-2">
                {t.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5"
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: 13,
                      color: "rgba(28,18,8,0.65)",
                    }}
                  >
                    <span
                      className="shrink-0 rounded-full"
                      style={{ width: 6, height: 6, background: "#C8A96E" }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* ── Legal Documentation ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="rounded-2xl p-6"
          style={{ background: "#fff", border: "1px solid rgba(28,18,8,0.1)" }}
        >
          <p
            className="mb-5 text-[#1C1208]"
            style={{
              fontFamily: "var(--font-cormorant)",
              fontWeight: 700,
              fontSize: "1.2rem",
              letterSpacing: "0.04em",
            }}
          >
            Legal Property Documentation
          </p>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {LEGAL_DOCS.map((doc, i) => (
              <li
                key={doc}
                className="flex items-start gap-2.5"
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 13,
                  color: "rgba(28,18,8,0.65)",
                }}
              >
                <span
                  className="shrink-0 font-semibold"
                  style={{ color: "#1C1208", minWidth: "1.4rem" }}
                >
                  {String(i + 1).padStart(2, "0")}.
                </span>
                {doc}
              </li>
            ))}
          </ul>
        </motion.div>

      </div>
    </section>
  );
}
