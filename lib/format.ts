/** Small formatting + slug helpers shared across UI, API, and storage. */

export function slugify(input: string): string {
  return input
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function formatPrice(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Compact price for hero/stat contexts, e.g. "$1.2M", "$18.5K". */
export function formatCompactPrice(amount: number, currency = "USD"): string {
  const symbol = (0).toLocaleString("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).replace(/\d/g, "").trim();
  if (amount >= 1_000_000) return `${symbol}${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}M`;
  if (amount >= 1_000) return `${symbol}${(amount / 1_000).toFixed(amount % 1_000 === 0 ? 0 : 1)}K`;
  return formatPrice(amount, currency);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

/** Strip markdown to plain text for short excerpts. */
export function toPlainText(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>#~-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function excerpt(markdown: string, max = 160): string {
  const text = toPlainText(markdown);
  return text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text;
}
