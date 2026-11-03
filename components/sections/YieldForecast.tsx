"use client";

import { useMemo, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";

/* ─── Yield math ──────────────────────────────────── */
const PRESETS = {
  Rental:  { yieldPct: 0.07, capGrowth: 0.04 },
  Growth:  { yieldPct: 0.04, capGrowth: 0.10 },
} as const;
type Strategy = keyof typeof PRESETS;

const LOCATIONS = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Hyderabad", "Peshawar"];

function calcResults(amount: number, strategy: Strategy, years: number) {
  const { yieldPct, capGrowth } = PRESETS[strategy];
  const income = amount * yieldPct * years;
  const finalValue = amount * Math.pow(1 + capGrowth, years);
  const profit = finalValue - amount + income;
  const roi = (profit / amount) * 100;
  const points = Array.from({ length: years + 1 }, (_, i) => ({
    year: i,
    value: amount * Math.pow(1 + capGrowth, i) + amount * yieldPct * i,
  }));
  return { income, profit, roi, points };
}

/* ─── Number formatter ────────────────────────────── */
function fmt(n: number) {
  return new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(n);
}

/** PKR compact label for chart axis — e.g. "1.2 Cr", "50 Lac" */
function fmtPKR(n: number): string {
  if (n >= 10_000_000) return `${(n / 10_000_000).toFixed(1)} Cr`;
  if (n >= 100_000)   return `${(n / 100_000).toFixed(1)} Lac`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
  return fmt(n);
}

/* ─── Animated Line Chart (pure SVG, white on dark) ── */
function ForecastChart({ points }: { points: { year: number; value: number }[] }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const W = 600; const H = 180;
  const pad = { l: 56, r: 16, t: 16, b: 36 };

  const vals = points.map(p => p.value);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = Math.max(max - min, 1);
  const xOf = (i: number) => pad.l + (i / (points.length - 1)) * (W - pad.l - pad.r);
  const yOf = (v: number) => pad.t + (1 - (v - min) / span) * (H - pad.t - pad.b);

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)},${yOf(p.value).toFixed(1)}`).join(" ");
  const area = `${path} L${xOf(points.length-1).toFixed(1)},${(H-pad.b)} L${xOf(0).toFixed(1)},${(H-pad.b)} Z`;

  // Y axis labels (4 ticks)
  const ticks = [0, 0.33, 0.66, 1].map(f => min + f * span);

  return (
    <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="w-full" aria-label="Yield forecast chart">
      <defs>
        <linearGradient id="yf-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FAF6EF" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#FAF6EF" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pad.l} x2={W - pad.r} y1={yOf(t)} y2={yOf(t)} stroke="rgba(255,255,255,0.08)" strokeWidth={1}/>
          <text x={pad.l - 6} y={yOf(t) + 4} textAnchor="end" fill="rgba(255,255,255,0.35)" fontSize={9}>
            {fmtPKR(t)} PKR
          </text>
        </g>
      ))}
      {/* X axis labels */}
      {points.map((p, i) => (
        <text key={i} x={xOf(i)} y={H - 8} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize={9}>
          YEAR {p.year}
        </text>
      ))}
      {/* Area fill */}
      <motion.path d={area} fill="url(#yf-area)"
        initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }} />
      {/* Line */}
      <motion.path d={path} fill="none" stroke="#FAF6EF" strokeWidth={2} strokeLinecap="round"
        initial={{ pathLength: reduce ? 1 : 0 }}
        animate={inView ? { pathLength: 1 } : {}}
        transition={{ duration: reduce ? 0 : 1.4, ease: "easeInOut" }} />
      {/* Dots */}
      {points.map((p, i) => (
        <motion.circle key={i} cx={xOf(i)} cy={yOf(p.value)} r={3.5} fill="#FAF6EF"
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: 0.6 + i * 0.08, duration: 0.25 }} />
      ))}
    </svg>
  );
}

/* ─── Main component ─────────────────────────────── */
export function YieldForecast() {
  const [strategy, setStrategy] = useState<Strategy>("Rental");
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [amount, setAmount] = useState(10_000_000); // 1 Crore PKR
  const [years, setYears] = useState(5);

  const { income, profit, roi, points } = useMemo(
    () => calcResults(amount, strategy, years),
    [amount, strategy, years]
  );

  return (
    <section id="forecast" className="scroll-mt-16 overflow-hidden">
      {/* Two-panel grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">

        {/* ─── LEFT: cream panel ─── */}
        <div
          className="relative flex flex-col items-center justify-center px-10 py-20 text-center"
          style={{ backgroundColor: "#FAF6EF", minHeight: 480 }}
        >
          {/* Vertical deco line top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0">
            <div style={{ width: 1, height: 56, background: "#1C1208", opacity: 0.3 }} />
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#1C1208", opacity: 0.5 }} />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            {/* ES monogram */}
            <p
              className="text-[#1C1208] opacity-60"
              style={{
                fontFamily: "var(--font-cormorant)",
                fontWeight: 400,
                fontSize: "clamp(1rem, 2.5vw, 1.6rem)",
                letterSpacing: "0.3em",
              }}
            >
              ES
            </p>

            {/* Script "Yield" */}
            <p
              className="leading-none text-[#1C1208] mt-1"
              style={{
                fontFamily: "var(--font-cormorant)",
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: "clamp(3rem, 7vw, 5.5rem)",
              }}
            >
              Yield
            </p>

            {/* FORECAST */}
            <p
              className="leading-none text-[#1C1208] -mt-2"
              style={{
                fontFamily: "var(--font-cormorant)",
                fontWeight: 700,
                fontSize: "clamp(3rem, 7vw, 5.5rem)",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
              }}
            >
              FORECAST
            </p>

            {/* Sub-text */}
            <p
              className="mt-6 max-w-xs mx-auto text-center"
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: "10px",
                fontWeight: 500,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(28,18,8,0.55)",
                lineHeight: 1.7,
              }}
            >
              ESTIMATE RENTAL INCOME, CAPITAL GROWTH, AND TOTAL
              RETURN WITH CLEAR PROJECTIONS BUILT FOR GLOBAL
              PROPERTY INVESTORS.
            </p>

            {/* Calculate button */}
            <div className="mt-8 flex justify-center">
              <button className="pill-btn-dark" style={{ paddingInline: "44px", paddingBlock: "12px" }}>
                Calculate
              </button>
            </div>
          </motion.div>

          {/* Vertical deco line bottom */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0">
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#1C1208", opacity: 0.5 }} />
            <div style={{ width: 1, height: 56, background: "#1C1208", opacity: 0.3 }} />
          </div>
        </div>

        {/* ─── RIGHT: dark panel ─── */}
        <div
          className="flex flex-col gap-6 px-8 py-10"
          style={{ backgroundColor: "#1C1208" }}
        >
          {/* Strategy toggle + Location */}
          <div className="flex flex-wrap items-start gap-6">
            {/* Strategy toggle */}
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.2em", color: "rgba(250,246,239,0.45)", textTransform: "uppercase" }}>
                STRATEGY
              </label>
              <div
                className="flex rounded-full p-1 gap-1"
                style={{ background: "rgba(250,246,239,0.1)", border: "1px solid rgba(250,246,239,0.1)" }}
              >
                {(["Rental", "Growth"] as Strategy[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStrategy(s)}
                    className="rounded-full px-5 py-2 text-sm font-medium transition-all"
                    style={{
                      background: strategy === s ? "#FAF6EF" : "transparent",
                      color: strategy === s ? "#1C1208" : "rgba(250,246,239,0.6)",
                      fontSize: 13,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="flex flex-col gap-2 flex-1 min-w-[160px]">
              <label style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.2em", color: "rgba(250,246,239,0.45)", textTransform: "uppercase" }}>
                LOCATION
              </label>
              <div className="relative">
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full appearance-none rounded-full px-4 py-2.5 text-sm pr-8 outline-none"
                  style={{
                    background: "rgba(250,246,239,0.1)",
                    border: "1px solid rgba(250,246,239,0.15)",
                    color: "#FAF6EF",
                    fontFamily: "var(--font-inter)",
                    fontSize: 13,
                  }}
                >
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l} className="bg-[#1C1208]">{l}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Amount + Years */}
          <div className="flex flex-wrap items-start gap-6">
            {/* Investment Amount */}
            <div className="flex flex-col gap-2 flex-1 min-w-[160px]">
              <label style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.2em", color: "rgba(250,246,239,0.45)", textTransform: "uppercase" }}>
                INVESTMENT AMOUNT
              </label>
              <div
                className="flex items-center rounded-full px-4 py-2.5 gap-3"
                style={{ background: "rgba(250,246,239,0.1)", border: "1px solid rgba(250,246,239,0.15)" }}
              >
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(10000, Number(e.target.value) || 0))}
                  className="w-full bg-transparent text-sm outline-none"
                  style={{ color: "#FAF6EF", fontFamily: "var(--font-inter)", fontSize: 13 }}
                  min={100000}
                  step={500000}
                />
                <span style={{ fontSize: 11, color: "rgba(250,246,239,0.45)", whiteSpace: "nowrap" }}>PKR</span>
              </div>
            </div>

            {/* Years */}
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.2em", color: "rgba(250,246,239,0.45)", textTransform: "uppercase" }}>
                PERIOD
              </label>
              <div className="flex gap-1">
                {[1, 3, 5].map((y) => (
                  <button
                    key={y}
                    onClick={() => setYears(y)}
                    className="rounded-full px-4 py-2 text-sm font-medium transition-all"
                    style={{
                      background: years === y ? "#FAF6EF" : "rgba(250,246,239,0.1)",
                      color: years === y ? "#1C1208" : "rgba(250,246,239,0.6)",
                      border: `1px solid ${years === y ? "#FAF6EF" : "rgba(250,246,239,0.15)"}`,
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {y}Y
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div>
            <p style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.2em", color: "rgba(250,246,239,0.45)", textTransform: "uppercase", marginBottom: 8 }}>
              INVESTMENT AMOUNT
            </p>
            <div
              className="rounded-xl p-3"
              style={{ background: "rgba(250,246,239,0.04)", border: "1px solid rgba(250,246,239,0.08)" }}
            >
              <ForecastChart points={points} />
            </div>
          </div>

          {/* Stats row — ROI / Income / Profit */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "ROI", value: `${roi.toFixed(1)}%`, icon: "📊" },
              { label: "INCOME (PKR)", value: fmt(income), icon: "💰" },
              { label: "PROFIT (PKR)", value: fmt(profit), icon: "💼" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center justify-center gap-2 rounded-xl py-5"
                style={{ background: "rgba(250,246,239,0.08)", border: "1px solid rgba(250,246,239,0.1)" }}
              >
                <span className="text-lg">{s.icon}</span>
                <span style={{ fontSize: 10, letterSpacing: "0.2em", color: "rgba(250,246,239,0.45)", textTransform: "uppercase" }}>
                  {s.label}
                </span>
                <span
                  className="text-[#FAF6EF] font-light"
                  style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(1.3rem,2.5vw,1.8rem)", letterSpacing: "0.02em" }}
                >
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
