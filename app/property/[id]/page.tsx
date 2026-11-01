import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Bath, Bed, Maximize2, MapPin, TrendingUp, Calendar } from "lucide-react";
import { getProperty } from "@/lib/db";
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
  const property = await getProperty(id);
  if (!property) return { title: "Property not found" };
  return {
    title: property.title,
    description: property.summary || `${property.type} in ${property.location}, ${property.region}`,
  };
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
  const property = await getProperty(id);
  if (!property) notFound();

  return (
    <>
      <Navbar forceSolid />

      <main className="pt-28">
        <div className="container-luxe">
          <Link
            href="/#properties"
            className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-espresso-900"
          >
            <ArrowLeft size={16} /> All holdings
          </Link>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-gold-600">
                {property.region} · {property.type}
              </p>
              <h1 className="mt-2 font-serif text-4xl text-espresso-900 md:text-5xl">{property.title}</h1>
              <p className="mt-2 inline-flex items-center gap-1.5 text-muted">
                <MapPin size={15} className="text-gold-600" /> {property.location}
              </p>
            </div>
            <div className="text-right">
              <p className="font-serif text-3xl text-espresso-900">{formatPrice(property.price, property.currency)}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
                {property.status === "available" ? "Available" : property.status === "sold" ? "Sold" : "Off market"}
              </p>
            </div>
          </div>
        </div>

        <div className="container-luxe mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <PropertyGallery images={property.images} title={property.title} />

            <div className="mt-10">
              <h2 className="font-serif text-2xl text-espresso-900">Overview</h2>
              <div className="mt-5 max-w-none text-[15px] leading-relaxed text-espresso-700 [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-xl [&_h2]:text-espresso-900 [&_li]:my-1 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-5 [&_p]:my-3">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{property.description}</ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Sticky info panel */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-espresso-900/8 bg-cream-100/60 p-6">
              <div className="grid grid-cols-3 gap-4">
                <Fact icon={<Bed size={18} />} label="Bedrooms" value={String(property.bedrooms)} />
                <Fact icon={<Bath size={18} />} label="Bathrooms" value={String(property.bathrooms)} />
                <Fact icon={<Maximize2 size={18} />} label="Area" value={`${formatNumber(property.areaSqft)} ft²`} />
              </div>

              <div className="mt-6 flex items-center justify-between rounded-xl bg-espresso-950 px-5 py-4 text-cream-50">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-cream-200/50">Forecast yield</p>
                  <p className="font-serif text-2xl text-gold-400">{property.yieldPercent.toFixed(1)}%</p>
                </div>
                <TrendingUp className="text-gold-400" />
              </div>

              <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Spec label="Type" value={property.type} />
                <Spec label="Region" value={property.region} />
                <Spec label="Location" value={property.location} />
                <Spec label="Listed" value={formatDate(property.createdAt)} />
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/#forecast"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-espresso-900 px-5 py-3 text-sm font-medium text-cream-50 transition-colors hover:bg-espresso-800"
                >
                  Model this yield <TrendingUp size={15} />
                </Link>
                <Link
                  href="/#access"
                  className="inline-flex items-center justify-center rounded-full border border-espresso-900/10 px-5 py-3 text-sm text-espresso-800 transition-colors hover:bg-cream-50"
                >
                  Request access
                </Link>
              </div>

              <p className="mt-5 flex items-center gap-2 text-xs text-muted">
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
      <div className="text-gold-600">{icon}</div>
      <p className="mt-2 font-serif text-lg text-espresso-900">{value}</p>
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{label}</p>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-0.5 text-espresso-900">{value}</p>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <>
      <Navbar forceSolid />
      <main className="container-luxe pt-28">
        <div className="h-4 w-24 animate-pulse rounded bg-cream-200/70" />
        <div className="mt-4 h-10 w-2/3 animate-pulse rounded bg-cream-200/70" />
        <div className="mt-8 h-80 animate-pulse rounded-2xl bg-cream-200/50" />
      </main>
    </>
  );
}
