import clsx from "clsx";
import type { ReactNode } from "react";

/**
 * Editorial section heading: eyebrow label, serif title, optional subtitle.
 * Server-compatible (no client directives).
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? (
        <div
          className={clsx(
            "flex items-center gap-3 mb-5",
            align === "center" && "justify-center",
          )}
        >
          <span className="h-px w-8 bg-gold-500" />
          <span className="text-[11px] font-medium uppercase tracking-[0.32em] text-gold-600">
            {eyebrow}
          </span>
          <span className="h-px w-8 bg-gold-500" />
        </div>
      ) : null}
      <h2 className="font-serif text-[2rem] leading-[1.08] text-espresso-900 sm:text-4xl md:text-[2.75rem]">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-5 text-[15px] leading-relaxed text-muted">{subtitle}</p>
      ) : null}
    </div>
  );
}
