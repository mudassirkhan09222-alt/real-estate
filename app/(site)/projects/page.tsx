import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AllProjectsGrid } from "@/components/sections/AllProjectsGrid";
import { getDB, type PropertyRow, type ImageRow } from "@/lib/db";
import type { Property } from "@/lib/types";

function getInitial() {
  try {
    const db = getDB();
    const total = (db.prepare("SELECT COUNT(*) as c FROM properties WHERE status='published'").get() as { c: number }).c;
    const rows  = db.prepare("SELECT * FROM properties WHERE status='published' ORDER BY created_at DESC LIMIT 12").all() as PropertyRow[];
    const items: (Property & { availability?: string })[] = rows.map(row => {
      const imgs = db.prepare("SELECT * FROM property_images WHERE property_id = ? ORDER BY sort_order").all(row.id) as ImageRow[];
      return {
        id: String(row.id), slug: String(row.id), title: row.title,
        summary: row.description.slice(0, 120), description: row.description,
        price: row.price, currency: "PKR",
        region: "Metropolitan" as const, location: row.location,
        type: "Apartment" as const, status: "available" as const,
        bedrooms: 0, bathrooms: 0, areaSqft: 0, yieldPercent: 0, featured: false,
        availability: row.availability ?? "available",
        images: imgs.map(i => ({ id: String(i.id), url: i.file_path, blurDataURL: undefined, alt: row.title, width: 800, height: 600 })),
        createdAt: row.created_at, updatedAt: row.updated_at,
      };
    });
    return { items, total, page: 1, pageSize: 12, hasMore: total > 12 };
  } catch {
    return { items: [], total: 0, page: 1, pageSize: 12, hasMore: false };
  }
}

export default function ProjectsPage() {
  const initial = getInitial();
  return (
    <>
      <Navbar forceSolid />
      <main className="min-h-screen pt-24 pb-20" style={{ background: "#FAF6EF" }}>
        <div className="estatio-container">
          {/* Page heading */}
          <div className="mb-10">
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 11, fontWeight: 700, letterSpacing: "0.24em", textTransform: "uppercase", color: "#C8A96E", marginBottom: 8 }}>
              Our Portfolio
            </p>
            <h1 style={{ fontFamily: "var(--font-cormorant)", fontSize: "clamp(2.2rem,5vw,3.5rem)", fontWeight: 700, color: "#1C1208", margin: 0, lineHeight: 1.1 }}>
              All Projects
            </h1>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 14, color: "#7A6652", marginTop: 8 }}>
              Browse every listing — click any card to view full details.
            </p>
          </div>

          <AllProjectsGrid initial={initial} />
        </div>
      </main>
      <Footer />
    </>
  );
}
