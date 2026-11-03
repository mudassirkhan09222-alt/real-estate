"use client";

import { motion } from "framer-motion";

/**
 * Animated decorative line with dot.
 * Both left and right lines slide in from their outer edge toward center.
 * Uses width animation instead of scaleX so flex-reverse works correctly.
 */
export function AnimatedDecoLine({
  flip = false,
  color = "#1C1208",
  opacity = 0.25,
  delay = 0,
}: {
  flip?: boolean;
  color?: string;
  opacity?: number;
  delay?: number;
}) {
  return (
    <div
      className="hidden md:flex flex-1 items-center min-w-0"
      style={{ flexDirection: flip ? "row-reverse" : "row" }}
    >
      {/* Dot */}
      <motion.span
        className="shrink-0 rounded-full"
        style={{
          width: 7,
          height: 7,
          background: color,
          margin: flip ? "0 0 0 10px" : "0 10px 0 0",
        }}
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: opacity * 2.2, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.3, delay }}
      />

      {/* Line — grows from dot side outward using width 0→100% */}
      <div
        className="flex-1 min-w-0 overflow-hidden"
        style={{
          /* right-side line: align content to right so it grows left→right visually from center */
          display: "flex",
          justifyContent: flip ? "flex-end" : "flex-start",
        }}
      >
        <motion.span
          style={{
            display: "block",
            height: 1,
            background: color,
            opacity,
            width: "100%",
          }}
          initial={{ width: "0%" }}
          whileInView={{ width: "100%" }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, delay: delay + 0.1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
