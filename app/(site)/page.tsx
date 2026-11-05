import { HeroSection } from "@/components/sections/HeroSection";
import { AccessProperty } from "@/components/sections/AccessProperty";
import { PropertyGrid } from "@/components/sections/PropertyGrid";
import { InvestmentsProtected } from "@/components/sections/InvestmentsProtected";
import { YieldForecast } from "@/components/sections/YieldForecast";
import { YieldForecastBanner } from "@/components/sections/YieldForecastBanner";
import { TermsConditions } from "@/components/sections/TermsConditions";
import { Footer } from "@/components/layout/Footer";
import { getDB, type PropertyRow, type ImageRow } from "@/lib/db";
import type { PaginatedResult, Property } from "@/lib/types";

function getInitialProperties(): PaginatedResult<Property> {
  try {
    const db = getDB();
    const total = (db.prepare("SELECT COUNT(*) as c FROM properties WHERE status='published'").get() as { c: number }).c;
    const rows = db.prepare("SELECT * FROM properties WHERE status='published' ORDER BY created_at DESC LIMIT 9").all() as PropertyRow[];
    const items: Property[] = rows.map(row => {
      const imgs = db.prepare("SELECT * FROM property_images WHERE property_id = ? ORDER BY sort_order").all(row.id) as ImageRow[];
      return {
        id: String(row.id), slug: String(row.id), title: row.title,
        summary: row.description.slice(0, 120), description: row.description,
        price: row.price, currency: "PKR", region: "Metropolitan" as const, location: row.location,
        type: "Apartment" as const, status: "available" as const,
        bedrooms: 0, bathrooms: 0, areaSqft: 0, yieldPercent: 0, featured: false,
        availability: row.availability ?? "available",
        images: imgs.map(i => ({ id: String(i.id), url: i.file_path, blurDataURL: undefined, alt: row.title, width: 800, height: 600 })),
        createdAt: row.created_at, updatedAt: row.updated_at,
      };
    });
    return { items, total, page: 1, pageSize: 9, hasMore: total > 9 };
  } catch {
    return { items: [], total: 0, page: 1, pageSize: 9, hasMore: false };
  }
}

export default function Home() {
  const initial = getInitialProperties();
  return (
    <>
      <HeroSection />
      <AccessProperty />
      <PropertyGrid initial={initial} />
      <InvestmentsProtected />
      <YieldForecast />
      <YieldForecastBanner />
      <TermsConditions />
      <Footer />
    </>
  );
}
