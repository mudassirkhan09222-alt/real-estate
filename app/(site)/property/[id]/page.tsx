import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Bath, Bed, Maximize2, MapPin, TrendingUp, Calendar } from "lucide-react";
import { dbGetProperty, dbGetImages, type PropertyRow, type ImageRow } from "@/lib/db";
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
  const row = await dbGetProperty(Number(id));
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
  const row = await dbGetProperty(Number(id));
  if (!row) notFound();
  const imgs = await dbGetImages(row!.id);
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
                <a
                  href="https://wa.me/923122249346"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-white"
                  style={{ background: "#25D366" }}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.828L.057 23.776a.5.5 0 0 0 .614.637l6.071-1.525A11.935 11.935 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.655-.511-5.178-1.401l-.37-.22-3.833.963.98-3.77-.241-.388A9.933 9.933 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                  Contact us on WhatsApp
                </a>
                <a
                  href="tel:+923122249346"
                  className="inline-flex items-center justify-center rounded-full border border-[rgba(28,18,8,0.1)] px-5 py-3 text-sm text-[#1C1208] hover:bg-[#F2ECE1]"
                >
                  📞 0312-2249346
                </a>
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
