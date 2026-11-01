"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, ShieldCheck, Landmark, FileSearch, Lock, Scale } from "lucide-react";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";

const CARDS = [
  {
    icon: ShieldCheck,
    title: "Title Insurance",
    body: "Every holding transfers with insured, clean title — verified before you commit capital.",
  },
  {
    icon: Landmark,
    title: "Escrow Protection",
    body: "Funds sit in regulated escrow and release only when contract milestones are met.",
  },
  {
    icon: FileSearch,
    title: "Due Diligence",
    body: "Independent legal, structural, and tenure reviews are completed for each listing.",
  },
  {
    icon: Lock,
    title: "Capital Security",
    body: "Vetted holding structures are designed to preserve capital across market cycles.",
  },
  {
    icon: Scale,
    title: "Local Counsel",
    body: "On-ground legal partners in each region guide you through local requirements.",
  },
];

export function InvestmentsProtected() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("[data-card]")?.getBoundingClientRect().width ?? 320;
    el.scrollBy({ left: dir * (cardWidth + 24), behavior: "smooth" });
  };

  return (
    <section id="protected" className="bg-cream-100 py-24 scroll-mt-24">
      <div className="container-luxe">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <AnimatedSection>
            <SectionHeading
              eyebrow="Investments Protected"
              title="Five layers of protection on every holding"
              subtitle="Acquiring international property shouldn't feel like a leap. Each listing moves through a structured protection process before it reaches you."
            />
          </AnimatedSection>
          <div className="hidden gap-2 md:flex">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => scrollBy(-1)}
              className="grid h-11 w-11 place-items-center rounded-full border border-espresso-900/10 text-espresso-800 transition-colors hover:bg-cream-50"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => scrollBy(1)}
              className="grid h-11 w-11 place-items-center rounded-full border border-espresso-900/10 text-espresso-800 transition-colors hover:bg-cream-50"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <AnimatedSection delay={0.05} className="mt-12">
        <div
          ref={trackRef}
          className="container-luxe flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {CARDS.map((c, i) => {
            const Icon = c.icon;
            return (
              <article
                key={c.title}
                data-card
                className="group relative flex min-w-[280px] flex-1 snap-start flex-col rounded-2xl border border-espresso-900/8 bg-cream-50 p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-luxe md:min-w-0"
                style={{ flexBasis: `calc((100% - 4 * 1.5rem) / 5)` }}
              >
                <span className="font-serif text-4xl text-cream-300 transition-colors group-hover:text-gold-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mt-6 grid h-12 w-12 place-items-center rounded-full bg-espresso-900 text-gold-400">
                  <Icon size={22} />
                </span>
                <h3 className="mt-5 font-serif text-xl text-espresso-900">{c.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{c.body}</p>
              </article>
            );
          })}
        </div>
      </AnimatedSection>
    </section>
  );
}
