"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Eye, Pencil, Save } from "lucide-react";
import { ImageUploader } from "./ImageUploader";
import { PROPERTY_STATUSES, PROPERTY_TYPES, REGIONS } from "@/lib/types";
import type { Property, PropertyImage, PropertyInput, PropertyStatus, PropertyType, Region } from "@/lib/types";

type Props =
  | { mode: "create" }
  | { mode: "edit"; property: Property };

export function PropertyForm(props: Props) {
  const router = useRouter();
  const initial = props.mode === "edit" ? props.property : undefined;

  const [title, setTitle] = useState(initial?.title ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial ? String(initial.price) : "");
  const [currency, setCurrency] = useState(initial?.currency ?? "USD");
  const [region, setRegion] = useState<Region>(initial?.region ?? "Metropolitan");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [type, setType] = useState<PropertyType>(initial?.type ?? "Apartment");
  const [status, setStatus] = useState<PropertyStatus>(initial?.status ?? "available");
  const [bedrooms, setBedrooms] = useState(initial ? String(initial.bedrooms) : "");
  const [bathrooms, setBathrooms] = useState(initial ? String(initial.bathrooms) : "");
  const [area, setArea] = useState(initial ? String(initial.areaSqft) : "");
  const [yieldPct, setYieldPct] = useState(initial ? String(initial.yieldPercent) : "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [images, setImages] = useState<PropertyImage[]>(initial?.images ?? []);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [descTab, setDescTab] = useState<"write" | "preview">("write");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError("Title is required.");
    if (!price || Number(price) <= 0) return setError("Price must be a positive number.");

    const payload: PropertyInput = {
      title: title.trim(),
      summary: summary.trim(),
      description: description.trim(),
      price: Number(price),
      currency: currency.trim() || "USD",
      region,
      location: location.trim(),
      type,
      status,
      bedrooms: Number(bedrooms) || 0,
      bathrooms: Number(bathrooms) || 0,
      areaSqft: Number(area) || 0,
      yieldPercent: Number(yieldPct) || 0,
      featured,
      images,
    };

    setSaving(true);
    try {
      const res = await fetch(
        props.mode === "edit" ? `/api/properties/${initial!.id}` : "/api/properties",
        { method: props.mode === "edit" ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save failed");
      router.push("/admin/properties");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link href="/admin/properties" className="inline-flex items-center gap-2 text-sm text-muted hover:text-espresso-900">
            <ArrowLeft size={15} /> Back to properties
          </Link>
          <h1 className="mt-2 font-serif text-3xl text-espresso-900">
            {props.mode === "edit" ? "Edit listing" : "New listing"}
          </h1>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-espresso-900 px-6 py-3 text-sm font-medium text-cream-50 transition-colors hover:bg-espresso-800 disabled:opacity-50"
        >
          <Save size={15} /> {saving ? "Saving…" : "Save listing"}
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Main column */}
        <div className="space-y-6">
          <Card title="Details">
            <Field label="Title">
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="Overwater Reserve Villa" />
            </Field>
            <Field label="Summary" hint="Shown on listing cards">
              <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} className={inputCls} placeholder="A private lagoon-front villa…" />
            </Field>
          </Card>

          <Card title="Description">
            <div className="mb-3 flex gap-1 rounded-full bg-cream-100 p-1">
              <TabBtn active={descTab === "write"} onClick={() => setDescTab("write")}><Pencil size={13} /> Write</TabBtn>
              <TabBtn active={descTab === "preview"} onClick={() => setDescTab("preview")}><Eye size={13} /> Preview</TabBtn>
            </div>
            {descTab === "write" ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={12}
                className={`${inputCls} font-mono text-[13px]`}
                placeholder={"Markdown supported.\n\n## Investment case\n- Projected yield of 6.2%\n- Protected tenure"}
              />
            ) : (
              <div className="min-h-[16rem] rounded-xl border border-espresso-900/8 bg-cream-50 p-5 text-sm leading-relaxed text-espresso-700 [&_h2]:mt-4 [&_h2]:font-serif [&_h2]:text-lg [&_h2]:text-espresso-900 [&_li]:my-1 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5">
                {description.trim() ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{description}</ReactMarkdown>
                ) : (
                  <p className="text-muted">Nothing to preview yet.</p>
                )}
              </div>
            )}
          </Card>

          <Card title="Images">
            <ImageUploader images={images} onChange={setImages} />
          </Card>
        </div>

        {/* Sidebar column */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card title="Pricing">
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <Field label="Price">
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} placeholder="4850000" min={0} />
              </Field>
              <Field label="Currency">
                <input value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputCls} maxLength={3} placeholder="USD" />
              </Field>
            </div>
            <Field label="Forecast yield %">
              <input type="number" step="0.1" value={yieldPct} onChange={(e) => setYieldPct(e.target.value)} className={inputCls} placeholder="6.2" />
            </Field>
          </Card>

          <Card title="Location">
            <Field label="Region">
              <select value={region} onChange={(e) => setRegion(e.target.value as Region)} className={inputCls}>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Location label">
              <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} placeholder="Lagoon District" />
            </Field>
          </Card>

          <Card title="Attributes">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Beds"><input type="number" value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className={inputCls} placeholder="4" min={0} /></Field>
              <Field label="Baths"><input type="number" value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} className={inputCls} placeholder="5" min={0} /></Field>
              <Field label="ft²"><input type="number" value={area} onChange={(e) => setArea(e.target.value)} className={inputCls} placeholder="5200" min={0} /></Field>
            </div>
            <Field label="Type">
              <select value={type} onChange={(e) => setType(e.target.value as PropertyType)} className={inputCls}>
                {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={status} onChange={(e) => setStatus(e.target.value as PropertyStatus)} className={inputCls}>
                {PROPERTY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <label className="flex items-center gap-3 rounded-xl border border-espresso-900/8 bg-cream-50 px-4 py-3">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="h-4 w-4 accent-gold-500" />
              <span className="text-sm text-espresso-800">Feature this listing</span>
            </label>
          </Card>
        </div>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-xl border border-espresso-900/10 bg-cream-50 px-4 py-2.5 text-sm text-espresso-900 outline-none transition-colors placeholder:text-muted focus:border-gold-500";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-espresso-900/8 bg-cream-100/40 p-6">
      <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-gold-600">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-espresso-700">{label}{hint ? <span className="ml-2 text-xs text-muted">{hint}</span> : null}</span>
      {children}
    </label>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm transition-colors ${active ? "bg-espresso-900 text-cream-50" : "text-espresso-700"}`}
    >
      {children}
    </button>
  );
}
