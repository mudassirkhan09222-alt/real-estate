export const dynamic = "force-dynamic";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AllProjectsGrid } from "@/components/sections/AllProjectsGrid";
import { dbGetProperties, dbGetImages } from "@/lib/db";
import type { Property } from "@/lib/types";

async function getInitial() {
  try {
    const { rows, total } = await dbGetProperties({ status: "published", page: 1, pageSize: 12 });
    const items: (Property & { availability?: string })[] = await Promise.all(
      rows.map(async row => {
        const imgs = await dbGetImages(row.id);
        return {
          id: String(row.id), slug: String(row.id), title: row.title,
          summary: row.description.slice(0, 120), description: row.description,
          price: row.price, currency: "PKR",
          region: "Metropolitan" as const, location: row.location,
          type: "Apartment" as const, status: "available" as const,
          bedrooms: 0, bathrooms: 0, areaSqft: 0, yieldPercent: 0, featured: false,
          availability: row.availability ?? "available",
          images: imgs.map(i => ({ id: String(i.id), url: i.file_path, blurDataURL: undefined, alt: row.title, width: 800, height: 600 })),
          createdAt: String(row.created_at), updatedAt: String(row.updated_at),
        };
      })
    );
    return { items, total, page: 1, pageSize: 12, hasMore: total > 12 };
  } catch (_e) {
    return { items: [], total: 0, page: 1, pageSize: 12, hasMore: false };
  }
}

export default async function ProjectsPage() {
  const initial = await getInitial();
  return (
    <>
      <Navbar forceSolid />
      <main className="min-h-screen pt-24 pb-20" style={{ background: "#FAF6EF" }}>
        <div className="estatio-container">
          <div className="mb-10">
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: "#C8A96E", marginBottom: 8 }}>Our Portfolio</p>
            <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(2.2rem,5vw,3.5rem)", fontWeight: 700, color: "#1C1208", margin: 0, lineHeight: 1.1 }}>All Projects</h1>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#7A6652", marginTop: 8 }}>Browse every listing — click any card to view full details.</p>
          </div>
          <AllProjectsGrid initial={initial} />
        </div>
      </main>
      <Footer />
    </>
  );
}
