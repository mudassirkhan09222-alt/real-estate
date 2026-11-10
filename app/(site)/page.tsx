import { HeroSection } from "@/components/sections/HeroSection";
import { AccessProperty } from "@/components/sections/AccessProperty";
import { PropertyGrid } from "@/components/sections/PropertyGrid";
import { InvestmentsProtected } from "@/components/sections/InvestmentsProtected";
import { YieldForecast } from "@/components/sections/YieldForecast";
import { YieldForecastBanner } from "@/components/sections/YieldForecastBanner";
import { TermsConditions } from "@/components/sections/TermsConditions";
import { ContactForm } from "@/components/sections/ContactForm";
import { Footer } from "@/components/layout/Footer";
import { dbGetProperties, dbGetImages } from "@/lib/db";
import type { PaginatedResult, Property } from "@/lib/types";

async function getInitialProperties(): Promise<PaginatedResult<Property>> {
  try {
    const { rows, total } = await dbGetProperties({ status: "published", page: 1, pageSize: 6 });
    const items: (Property & { availability?: string })[] = await Promise.all(
      rows.map(async row => {
        const imgs = await dbGetImages(row.id);
        return {
          id: String(row.id), slug: String(row.id), title: row.title,
          summary: row.description.slice(0, 120), description: row.description,
          price: row.price, currency: "PKR",
          region: "Metropolitan" as const, location: row.location,
          type: "Apartment" as const,
          status: "available" as const,
          bedrooms: 0, bathrooms: 0, areaSqft: 0, yieldPercent: 0, featured: false,
          availability: row.availability ?? "available",
          images: imgs.map(i => ({ id: String(i.id), url: i.file_path, blurDataURL: undefined, alt: row.title, width: 800, height: 600 })),
          createdAt: String(row.created_at), updatedAt: String(row.updated_at),
        };
      })
    );
    return { items, total, page: 1, pageSize: 6, hasMore: total > 6 };
  } catch (_e) {
    return { items: [], total: 0, page: 1, pageSize: 6, hasMore: false };
  }
}

export default async function Home() {
  const initial = await getInitialProperties();
  return (
    <>
      <HeroSection />
      <AccessProperty />
      <PropertyGrid initial={initial} />
      <InvestmentsProtected />
      <YieldForecast />
      <YieldForecastBanner />
      <TermsConditions />
      <ContactForm />
      <Footer />
    </>
  );
}
