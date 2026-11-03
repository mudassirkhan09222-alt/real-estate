import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Bath, Bed, Maximize2, MapPin, TrendingUp, Calendar } from "lucide-react";
import { getDB, type PropertyRow, type ImageRow } from "@/lib/db";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PropertyGallery } from "@/components/sections/PropertyGallery";
import { formatDate, formatNumber, formatPrice } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const db  = getDB();
  const row = db.prepare("SELECT * FROM properties WHERE id = ?").get(Number(id)) as PropertyRow | undefined;
  if (!row) return { title: "Property not found" };
  return { title: row.title, description: row.description.slice(0,160) || `Property in ${row.location}` };
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <PropertyDetail params={params} />
    </Suspense>
  );
}

async function PropertyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db  = getDB();
  const row = db.prepare("SELECT * FROM properties WHERE id = ?").get(Number(id)) as PropertyRow | undefined;
  if (!row) notFound();
  const imgs = db.prepare("SELECT * FROM property_images WHERE property_id = ? ORDER BY sort_order").all(row!.id) as ImageRow[];
  const property = {
    id: String(row!.id), slug: String(row!.id), title: row!.title,
    summary: row!.description.slice(0,120), description: row!.description,
    price: row!.price, currency: "PKR",
    region: "Metropolitan" as const, location: row!.location, type: "Apartment" as const,
    status: "available" as const,
    bedrooms: 0, bathrooms: 0, areaSqft: 0, yieldPercent: 0, featured: false,
    images: imgs.map(i => ({ id: String(i.id), url: i.file_path, blurDataURL: undefined as undefined, alt: row!.title, width: 800, height: 600 })),
    createdAt: row!.created_at, updatedAt: row!.updated_at,
  };

  return (
    <>
      <Navbar forceSolid />
      <main className="pt-28">
        <div className="estatio-container">
          <Link href="/#properties" className="inline-flex items-center gap-2 text-sm text-[#7A6652] hover:text-[#1C1208]">
            <ArrowLeft size={16} /> All Projects
          </Link>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em]" style={{ color: "#C8A96E" }}>
                {property.type} · {property.location}
              </p>
              <h1 className="mt-2 font-serif text-4xl text-[#1C1208] md:text-5xl">{property.title}</h1>
              <p className="mt-2 inline-flex items-center gap-1.5 text-[#7A6652]">
                <MapPin size={15} style={{ color: "#C8A96E" }} /> {property.location}
              </p>
            </div>
            <div className="text-right">
              <p className="font-serif text-3xl text-[#1C1208]">{formatPrice(property.price, property.currency)}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#7A6652]">
                {property.status === "available" ? "Available" : property.status === "sold" ? "Sold" : "Off market"}
              </p>
            </div>
          </div>
        </div>

        <div className="estatio-container mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <PropertyGallery images={property.images} title={property.title} />
            <div className="mt-10">
              <h2 className="font-serif text-2xl text-[#1C1208]">Description</h2>
              <div className="mt-5 text-[15px] leading-relaxed text-[#3a2e25] [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:text-[#1C1208] [&_li]:my-1 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_p]:my-3">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{property.description || "_No description yet._"}</ReactMarkdown>
              </div>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-[rgba(28,18,8,0.1)] bg-[#F2ECE1] p-6">
              <div className="grid grid-cols-3 gap-4">
                {property.bedrooms > 0 && <Fact icon={<Bed size={18} />} label="Beds" value={String(property.bedrooms)} />}
                {property.bathrooms > 0 && <Fact icon={<Bath size={18} />} label="Baths" value={String(property.bathrooms)} />}
                {property.areaSqft > 0 && <Fact icon={<Maximize2 size={18} />} label="Area" value={`${formatNumber(property.areaSqft)}`} />}
              </div>

              {property.yieldPercent > 0 && (
                <div className="mt-6 flex items-center justify-between rounded-xl bg-[#1C1208] px-5 py-4 text-[#FAF6EF]">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[#FAF6EF]/50">Forecast Yield</p>
                    <p className="font-serif text-2xl" style={{ color: "#C8A96E" }}>{property.yieldPercent.toFixed(1)}%</p>
                  </div>
                  <TrendingUp style={{ color: "#C8A96E" }} />
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3">
                <Link href="/#forecast" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#1C1208] px-5 py-3 text-sm font-medium text-[#FAF6EF] hover:bg-[#2C1A0E]">
                  Model this yield <TrendingUp size={15} />
                </Link>
                <Link href="/#contact" className="inline-flex items-center justify-center rounded-full border border-[rgba(28,18,8,0.1)] px-5 py-3 text-sm text-[#1C1208] hover:bg-[#FAF6EF]">
                  Contact us
                </Link>
              </div>

              <p className="mt-5 flex items-center gap-2 text-xs text-[#7A6652]">
                <Calendar size={13} /> Updated {formatDate(property.updatedAt)}
              </p>
            </div>
          </aside>
        </div>
        <div className="h-20" />
      </main>
      <Footer />
    </>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div style={{ color: "#C8A96E" }}>{icon}</div>
      <p className="mt-2 font-serif text-lg text-[#1C1208]">{value}</p>
      <p className="text-[11px] uppercase tracking-[0.14em] text-[#7A6652]">{label}</p>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <>
      <Navbar forceSolid />
      <main className="estatio-container pt-28">
        <div className="h-4 w-24 animate-pulse rounded bg-[#E5DDD0]" />
        <div className="mt-4 h-10 w-2/3 animate-pulse rounded bg-[#E5DDD0]" />
        <div className="mt-8 h-80 animate-pulse rounded-2xl bg-[#E5DDD0]" />
      </main>
    </>
  );
}
