import { HeroSection } from "@/components/sections/HeroSection";
import { AccessProperty } from "@/components/sections/AccessProperty";
import { PropertyGrid } from "@/components/sections/PropertyGrid";
import { InvestmentsProtected } from "@/components/sections/InvestmentsProtected";
import { YieldForecast } from "@/components/sections/YieldForecast";
import { YieldForecastBanner } from "@/components/sections/YieldForecastBanner";
import { TermsConditions } from "@/components/sections/TermsConditions";
import { Footer } from "@/components/layout/Footer";
import { getProperties } from "@/lib/db";

export default async function Home() {
  // Server-side initial data for the grid — Payload Local API (in-process, no HTTP)
  let initial;
  try {
    initial = await getProperties({ page: 1, pageSize: 9 });
  } catch {
    // Payload DB not yet initialized (first run before migrations) — show empty grid
    initial = { items: [], page: 1, pageSize: 9, total: 0, hasMore: false };
  }

  return (
    <>
      <HeroSection />
      <AccessProperty />
      {/* Live property/project grid fed by Payload CMS */}
      <PropertyGrid initial={initial} />
      <InvestmentsProtected />
      <YieldForecast />
      <YieldForecastBanner />
      <TermsConditions />
      <Footer />
    </>
  );
}
