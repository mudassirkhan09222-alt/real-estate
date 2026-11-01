import clsx from "clsx";

/**
 * Hand-built city skyline silhouette used as the hero backdrop. Pure SVG so it
 * works offline, scales crisply, and stays tiny — no external hero image needed.
 * A handful of windows are lit in the brand gold to add depth against the dark
 * espresso sky.
 */
const BUILDINGS: { w: number; h: number; lit?: number[] }[] = [
  { w: 64, h: 150 },
  { w: 46, h: 96 },
  { w: 58, h: 190, lit: [0, 2, 4] },
  { w: 40, h: 120 },
  { w: 70, h: 240, lit: [1, 3, 5, 7] },
  { w: 50, h: 132 },
  { w: 84, h: 300, lit: [2, 5, 8, 11] },
  { w: 44, h: 110 },
  { w: 60, h: 170, lit: [0, 3] },
  { w: 52, h: 140 },
  { w: 78, h: 220, lit: [1, 4, 7, 9] },
  { w: 42, h: 100 },
  { w: 66, h: 175, lit: [2, 6] },
  { w: 48, h: 124 },
  { w: 72, h: 210, lit: [0, 3, 6, 9] },
  { w: 40, h: 92 },
];

const TOTAL_WIDTH = BUILDINGS.reduce((s, b) => s + b.w, 0);
// Precompute each building's x offset (prefix sum) so render never mutates state.
const LAYOUT = BUILDINGS.map((b, i) => ({
  ...b,
  x: BUILDINGS.slice(0, i).reduce((sum, prev) => sum + prev.w, 0),
}));

export function CitySkyline({ className }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${TOTAL_WIDTH} 300`}
      preserveAspectRatio="xMidYMax slice"
      className={clsx("h-full w-full", className)}
      aria-hidden="true"
    >
      {LAYOUT.map((b, i) => {
        const x = b.x;
        const cols = Math.max(2, Math.floor(b.w / 14));
        const rows = Math.max(3, Math.floor(b.h / 22));
        const windowCells: { cx: number; cy: number }[] = [];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            windowCells.push({
              cx: x + 6 + c * ((b.w - 12) / Math.max(cols - 1, 1)),
              cy: 300 - b.h + 14 + r * ((b.h - 24) / Math.max(rows - 1, 1)),
            });
          }
        }
        return (
          <g key={i}>
            <rect x={x} y={300 - b.h} width={b.w} height={b.h} fill="#120d0a" />
            {windowCells.map((cell, j) => {
              const isLit = b.lit?.includes(j) && j < windowCells.length;
              return (
                <rect
                  key={j}
                  x={cell.cx - 1.5}
                  y={cell.cy - 1.5}
                  width={3}
                  height={3}
                  fill={isLit ? "#b08d57" : "#1c1612"}
                  opacity={isLit ? 0.55 : 0.4}
                />
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
