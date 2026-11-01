import { getProperties } from "@/lib/db";
import { HeroSection } from "@/components/sections/HeroSection";
import { PropertyGrid } from "@/components/sections/PropertyGrid";
import { InvestmentsProtected } from "@/components/sections/InvestmentsProtected";
import { YieldForecast } from "@/components/sections/YieldForecast";
import { Footer } from "@/components/layout/Footer";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { ArrowRight } from "lucide-react";

/**
 * Reads the first page of listings at request time. With `cacheComponents` on,
 * nothing is cached unless explicitly opted in; `instant = false` marks this
 * route as allowed to block on that request-time read (rather than streaming
 * a static shell), so the grid is server-rendered for the first paint while
 * infinite scroll fetches the rest client-side.
 */
export const instant = false;

export default async function Home() {
  const initial = await getProperties({ page: 1, pageSize: 9 });

  return (
    <>
      <HeroSection />
      <PropertyGrid initial={initial} />
      <InvestmentsProtected />
      <YieldForecast />

      <section id="access" className="relative overflow-hidden bg-espresso-900 py-24 text-cream-50 scroll-mt-24">
        <div className="absolute inset-0 bg-[radial-gradient(80%_120%_at_80%_-10%,rgba(176,141,87,0.18),transparent_60%)]" />
        <div className="container-luxe relative">
          <div className="mx-auto max-w-2xl text-center">
            <AnimatedSection>
              <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-gold-400">Get Access</p>
              <h2 className="mt-5 font-serif text-4xl leading-tight text-cream-50 md:text-5xl">
                Request access to the full collection
              </h2>
              <p className="mt-5 text-cream-200/70">
                Create an account to see unlisted holdings, download due-diligence
                packs, and save properties to your watchlist.
              </p>
            </AnimatedSection>
            <AnimatedSection delay={0.08} className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#properties"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-500 px-7 py-3.5 text-sm font-medium text-espresso-950 transition-colors hover:bg-gold-400"
              >
                Browse holdings <ArrowRight size={16} />
              </a>
              <a
                href="/admin"
                className="inline-flex items-center justify-center rounded-full border border-cream-200/20 px-7 py-3.5 text-sm text-cream-50 transition-colors hover:bg-cream-50/5"
              >
                Admin dashboard
              </a>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
