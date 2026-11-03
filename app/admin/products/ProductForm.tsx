"use client";
import { useState, useRef, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Category { id: string; name: string; }
interface ProductImage { filePath: string; altText: string; }

interface ProductFormProps {
  mode: "create" | "edit";
  initial?: {
    id?: string; title?: string; description?: string; price?: number; currency?: string;
    location?: string; categoryId?: string | null; status?: string; bedrooms?: number;
    bathrooms?: number; areaSize?: number; areaUnit?: string; featured?: boolean;
    images?: ProductImage[];
  };
}

export default function ProductForm({ mode, initial }: ProductFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [currency, setCurrency] = useState(initial?.currency ?? "PKR");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [catId, setCatId] = useState(initial?.categoryId ?? "");
  const [status, setStatus] = useState(initial?.status ?? "draft");
  const [bedrooms, setBedrooms] = useState(String(initial?.bedrooms ?? ""));
  const [bathrooms, setBathrooms] = useState(String(initial?.bathrooms ?? ""));
  const [areaSize, setAreaSize] = useState(String(initial?.areaSize ?? ""));
  const [areaUnit, setAreaUnit] = useState(initial?.areaUnit ?? "Marla");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [images, setImages] = useState<ProductImage[]>(initial?.images ?? []);
  const [cats, setCats] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(setCats).catch(() => {});
  }, []);

  async function uploadFiles(files: FileList) {
    setUploading(true);
    try {
      const form = new FormData();
      Array.from(files).forEach(f => form.append("files", f));
      const r = await fetch("/api/upload", { method: "POST", body: form });
      const d = await r.json();
      if (!r.ok) { setError(d.error ?? "Upload failed"); return; }
      setImages(prev => [...prev, ...(d.images as { url: string; alt: string }[]).map(i => ({ filePath: i.url, altText: i.alt }))]);
    } catch { setError("Upload error"); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault(); setError(""); setSaving(true);
    const body = { title, description, price: Number(price) || 0, currency, location, categoryId: catId || null, status, bedrooms: Number(bedrooms) || 0, bathrooms: Number(bathrooms) || 0, areaSize: Number(areaSize) || 0, areaUnit, featured, images };
    try {
      const r = await fetch(mode === "edit" ? `/api/products/${initial?.id}` : "/api/products", {
        method: mode === "edit" ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) { setError(d.error ?? "Save failed"); return; }
      router.push("/admin/products"); router.refresh();
    } catch { setError("Network error"); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={onSubmit}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, margin: 0 }}>
          {mode === "edit" ? "Edit Product" : "Add New Product"}
        </h1>
        <div style={{ display: "flex", gap: 12 }}>
          <button type="button" onClick={() => router.back()} style={CancelBtn}>Cancel</button>
          <button type="submit" disabled={saving} style={SaveBtn}>{saving ? "Saving…" : mode === "edit" ? "Update" : "Create Product"}</button>
        </div>
      </div>

      {error && <div style={{ background: "#2a1010", border: "1px solid #f87171", borderRadius: 8, padding: "12px 16px", color: "#f87171", marginBottom: 20, fontSize: 14 }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
        {/* Left col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card title="Basic Info">
            <Field label="Title *"><input value={title} onChange={e => setTitle(e.target.value)} required style={InputS} placeholder="3-Bedroom House in DHA" /></Field>
            <Field label="Description"><textarea value={description} onChange={e => setDescription(e.target.value)} rows={5} style={{ ...InputS, resize: "vertical" }} placeholder="Full property description…" /></Field>
            <Field label="Location"><input value={location} onChange={e => setLocation(e.target.value)} style={InputS} placeholder="DHA Phase 6, Karachi" /></Field>
          </Card>

          <Card title="Images">
            <div style={{ border: "2px dashed #333", borderRadius: 10, padding: 20, textAlign: "center", cursor: "pointer" }} onClick={() => fileRef.current?.click()}>
              <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => e.target.files && uploadFiles(e.target.files)} />
              {uploading ? <p style={{ color: "#C8A96E" }}>Optimizing images…</p> : <p style={{ color: "#888", fontSize: 14 }}>📸 Click to upload images (WebP auto-optimized)</p>}
            </div>
            {images.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(100px,1fr))", gap: 10, marginTop: 16 }}>
                {images.map((img, i) => (
                  <div key={i} style={{ position: "relative", borderRadius: 8, overflow: "hidden", aspectRatio: "4/3", background: "#1a1a1a" }}>
                    <Image src={img.filePath} alt={img.altText} fill style={{ objectFit: "cover" }} sizes="120px" />
                    <button type="button" onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} style={{ position: "absolute", top: 4, right: 4, background: "#f87171", color: "#fff", border: "none", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", fontSize: 12, display: "grid", placeItems: "center" }}>×</button>
                    {i === 0 && <span style={{ position: "absolute", bottom: 4, left: 4, background: "#C8A96E", color: "#0f0f0f", fontSize: 9, fontWeight: 700, borderRadius: 4, padding: "2px 5px" }}>COVER</span>}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right col */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card title="Status & Pricing">
            <Field label="Status">
              <div style={{ display: "flex", gap: 8 }}>
                {["draft", "published"].map(s => (
                  <button key={s} type="button" onClick={() => setStatus(s)} style={{ flex: 1, padding: "9px", borderRadius: 8, border: `1px solid ${status === s ? (s === "published" ? "#4ade80" : "#facc15") : "#333"}`, background: status === s ? (s === "published" ? "#14532d" : "#1c1c1c") : "transparent", color: status === s ? (s === "published" ? "#4ade80" : "#facc15") : "#888", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                    {s === "published" ? "✅ Published" : "📝 Draft"}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Price">
              <div style={{ display: "flex", gap: 8 }}>
                <select value={currency} onChange={e => setCurrency(e.target.value)} style={{ ...InputS, width: 80 }}>
                  {["PKR","USD","AED"].map(c => <option key={c}>{c}</option>)}
                </select>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} style={InputS} placeholder="0" min={0} />
              </div>
            </Field>
            <Field label="Category">
              <select value={catId} onChange={e => setCatId(e.target.value)} style={InputS}>
                <option value="">— Select category —</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} style={{ width: 16, height: 16, accentColor: "#C8A96E" }} />
              <span style={{ color: "#ccc", fontSize: 14 }}>Featured listing</span>
            </label>
          </Card>

          <Card title="Details">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Bedrooms"><input type="number" value={bedrooms} onChange={e => setBedrooms(e.target.value)} style={InputS} min={0} /></Field>
              <Field label="Bathrooms"><input type="number" value={bathrooms} onChange={e => setBathrooms(e.target.value)} style={InputS} min={0} /></Field>
            </div>
            <Field label="Area Size">
              <div style={{ display: "flex", gap: 8 }}>
                <input type="number" value={areaSize} onChange={e => setAreaSize(e.target.value)} style={InputS} min={0} />
                <select value={areaUnit} onChange={e => setAreaUnit(e.target.value)} style={{ ...InputS, width: 100 }}>
                  {["Marla","Kanal","Sq Ft","Sq Yd"].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
            </Field>
          </Card>
        </div>
      </div>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#111", border: "1px solid #222", borderRadius: 12, padding: 24 }}>
      <p style={{ color: "#888", fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", margin: "0 0 16px" }}>{title}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", color: "#aaa", fontSize: 13, marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const InputS: React.CSSProperties = { width: "100%", background: "#1a1a1a", border: "1px solid #333", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" };
const SaveBtn: React.CSSProperties = { background: "#C8A96E", color: "#0f0f0f", border: "none", borderRadius: 10, padding: "11px 24px", fontWeight: 700, fontSize: 14, cursor: "pointer" };
const CancelBtn: React.CSSProperties = { background: "#1a1a1a", color: "#aaa", border: "1px solid #333", borderRadius: 10, padding: "11px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer" };
