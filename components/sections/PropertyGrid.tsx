/**
 * Home page property grid — shows first 6 published projects.
 * "View All Projects →" button takes users to /projects for the full list.
 */
import Link from "next/link";
import { PropertyCard } from "./PropertyCard";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowRight } from "lucide-react";
import type { PaginatedResult, Property } from "@/lib/types";

export function PropertyGrid({ initial }: { initial: PaginatedResult<Property> }) {
  const items = initial.items.slice(0, 6); // cap at 6 on home page

  return (
    <section id="properties" className="scroll-mt-20" style={{ backgroundColor: "#FAF6EF" }}>
      <div className="estatio-container py-16 md:py-24">

        <AnimatedSection>
          <SectionHeading
            eyebrow="Our Projects"
            title="Latest Projects & Properties"
            subtitle="A selection of our current listings. Click any project for full details."
          />
        </AnimatedSection>

        {/* Grid — max 6 cards */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.8rem", color: "#1C1208" }}>
                No projects yet
              </p>
            </div>
          ) : (
            items.map(p => <PropertyCard key={p.id} property={p} />)
          )}
        </div>

        {/* View All Projects button */}
        {initial.total > 0 && (
          <AnimatedSection delay={0.1} className="mt-12 flex justify-center">
            <Link
              href="/projects"
              className="inline-flex items-center gap-3 rounded-full px-8 py-4 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: "#1C1208",
                color: "#FAF6EF",
                fontFamily: "var(--font-inter)",
                letterSpacing: "0.06em",
                boxShadow: "0 4px 20px rgba(28,18,8,0.18)",
              }}
            >
              View All Projects
              <ArrowRight size={16} />
            </Link>
          </AnimatedSection>
        )}

      </div>
    </section>
  );
}
