"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import clsx from "clsx";

export interface LinePoint {
  label: string;
  value: number;
}

/**
 * Animated SVG line chart. The line draws itself in (pathLength 0→1) and the
 * area gradient + dots fade in once the chart scrolls into view. Pure SVG,
 * no chart library — keeps the bundle light and the animation fully controllable.
 */
export function LineChart({
  points,
  height = 240,
  className,
  stroke = "#c2a878",
  areaId = "forecast-area",
}: {
  points: LinePoint[];
  height?: number;
  className?: string;
  stroke?: string;
  areaId?: string;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();

  const W = 760;
  const H = height;
  const pad = { l: 10, r: 10, t: 18, b: 30 };

  const values = points.map((p) => p.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = Math.max(max - min, 1);

  const x = (i: number) => pad.l + (i / Math.max(points.length - 1, 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - min) / span) * (H - pad.t - pad.b);

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L ${x(points.length - 1).toFixed(1)} ${(H - pad.b).toFixed(1)} L ${x(0).toFixed(1)} ${(H - pad.b).toFixed(1)} Z`;

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      className={clsx("w-full h-auto", className)}
      role="img"
      aria-label="Projected portfolio value over the holding period"
    >
      <defs>
        <linearGradient id={areaId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* horizontal guides */}
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={pad.l}
          x2={W - pad.r}
          y1={pad.t + f * (H - pad.t - pad.b)}
          y2={pad.t + f * (H - pad.t - pad.b)}
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
        />
      ))}

      <motion.path
        d={areaPath}
        fill={`url(#${areaId})`}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.9, delay: 0.25 }}
      />

      <motion.path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: reduce ? 1 : 0 }}
        animate={inView ? { pathLength: 1 } : {}}
        transition={{ duration: reduce ? 0 : 1.2, ease: "easeInOut" }}
      />

      {points.map((p, i) => (
        <motion.circle
          key={i}
          cx={x(i)}
          cy={y(p.value)}
          r={3.5}
          fill={stroke}
          initial={{ scale: 0, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: 0.5 + i * 0.06, duration: 0.3 }}
        />
      ))}

      {points.map((p, i) => (
        <text
          key={i}
          x={x(i)}
          y={H - 8}
          textAnchor="middle"
          className="fill-white/45"
          style={{ fontSize: 11 }}
        >
          {p.label}
        </text>
      ))}
    </svg>
  );
}
