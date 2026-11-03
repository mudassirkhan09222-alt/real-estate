"use client";
import { useState, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Img { id?: number; filePath: string; }

interface Props {
  mode: "create" | "edit";
  initial?: {
    id?: number; title?: string; description?: string; price?: number;
    location?: string; status?: string; images?: Img[];
  };
}

export default function PropertyForm({ mode, initial }: Props) {
  const router = useRouter();
  const [title,       setTitle]       = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price,       setPrice]       = useState(String(initial?.price ?? ""));
  const [location,    setLocation]    = useState(initial?.location ?? "");
  const [status,      setStatus]      = useState(initial?.status ?? "draft");
  const [images,      setImages]      = useState<Img[]>(initial?.images ?? []);
  const [removedIds,  setRemovedIds]  = useState<number[]>([]);
  const [newFiles,    setNewFiles]    = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setNewFiles(prev => [...prev, ...files]);
    files.forEach(f => { const url = URL.createObjectURL(f); setNewPreviews(prev => [...prev, url]); });
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeExisting(id: number) {
    setImages(prev => prev.filter(i => i.id !== id));
    setRemovedIds(prev => [...prev, id]);
  }
  function removeNew(idx: number) {
    URL.revokeObjectURL(newPreviews[idx]);
    setNewFiles(prev => prev.filter((_, i) => i !== idx));
    setNewPreviews(prev => prev.filter((_, i) => i !== idx));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault(); setError(""); setSaving(true);
    const form = new FormData();
    form.set("title",       title);
    form.set("description", description);
    form.set("price",       price);
    form.set("location",    location);
    form.set("status",      status);
    if (mode === "edit" && removedIds.length) form.set("remove_image_ids", removedIds.join(","));
    for (const f of newFiles) form.append("images", f);

    const url    = mode === "edit" ? `/api/admin/properties/${initial!.id}` : "/api/admin/properties";
    const method = mode === "edit" ? "PUT" : "POST";
    const r = await fetch(url, { method, body: form });
    const d = await r.json();
    setSaving(false);
    if (!r.ok) { setError(d.error ?? "Save failed"); return; }
    router.push("/admin/products"); router.refresh();
  }

  const allPreviews: { src: string; onRemove: () => void }[] = [
    ...images.map(i => ({ src: i.filePath, onRemove: () => removeExisting(i.id!) })),
    ...newPreviews.map((src, i) => ({ src, onRemove: () => removeNew(i) })),
  ];

  return (
    <form onSubmit={onSubmit}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, margin: 0 }}>
          {mode === "edit" ? "Edit Property" : "Add New Property"}
        </h1>
        <div style={{ display: "flex", gap: 12 }}>
          <button type="button" onClick={() => router.back()} style={CAN}>Cancel</button>
          <button type="submit" disabled={saving} style={SAV}>{saving ? "Saving…" : mode === "edit" ? "Save Changes" : "Create Property"}</button>
        </div>
      </div>

      {error && <div style={{ background: "#2a1010", border: "1px solid #f87171", borderRadius: 9, padding: "12px 16px", color: "#f87171", marginBottom: 20, fontSize: 14 }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 22, alignItems: "start" }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card title="Property Details">
            <F label="Title *"><input value={title} onChange={e => setTitle(e.target.value)} required style={INP} placeholder="3-Bedroom House in DHA Phase 6" /></F>
            <F label="Description"><textarea value={description} onChange={e => setDescription(e.target.value)} rows={6} style={{ ...INP, resize: "vertical" }} placeholder="Full description of the property…" /></F>
            <F label="Location"><input value={location} onChange={e => setLocation(e.target.value)} style={INP} placeholder="DHA Phase 6, Karachi" /></F>
          </Card>

          <Card title="Images">
            <div style={{ border: "2px dashed #2a2a2a", borderRadius: 10, padding: "20px", textAlign: "center", cursor: "pointer" }} onClick={() => fileRef.current?.click()}>
              <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={onFileChange} />
              <p style={{ color: "#555", fontSize: 14, margin: 0 }}>📸 Click to upload images (WebP auto-converted)</p>
            </div>
            {allPreviews.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(90px,1fr))", gap: 8, marginTop: 14 }}>
                {allPreviews.map(({ src, onRemove }, i) => (
                  <div key={i} style={{ position: "relative", borderRadius: 8, overflow: "hidden", aspectRatio: "4/3", background: "#1e1e1e" }}>
                    <Image src={src} alt="" fill style={{ objectFit: "cover" }} sizes="100px" unoptimized={src.startsWith("blob:")} />
                    {i === 0 && <span style={{ position: "absolute", bottom: 3, left: 3, background: "#C8A96E", color: "#0c0c0c", fontSize: 8, fontWeight: 800, borderRadius: 3, padding: "2px 4px" }}>COVER</span>}
                    <button type="button" onClick={onRemove} style={{ position: "absolute", top: 3, right: 3, background: "#f87171", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, cursor: "pointer", fontSize: 11, display: "grid", placeItems: "center" }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card title="Pricing & Status">
            <F label="Price (PKR)"><input type="number" value={price} onChange={e => setPrice(e.target.value)} style={INP} placeholder="0" min={0} /></F>
            <F label="Status">
              <div style={{ display: "flex", gap: 8 }}>
                {["draft","published"].map(s => (
                  <button key={s} type="button" onClick={() => setStatus(s)} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: `1px solid ${status === s ? (s === "published" ? "#4ade80" : "#facc15") : "#2a2a2a"}`, background: status === s ? (s === "published" ? "#14532d" : "#1c1c1c") : "transparent", color: status === s ? (s === "published" ? "#4ade80" : "#facc15") : "#666", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                    {s === "published" ? "✅ Publish" : "📝 Draft"}
                  </button>
                ))}
              </div>
            </F>
          </Card>
        </div>
      </div>
    </form>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#161616", border: "1px solid #222", borderRadius: 12, padding: 22 }}>
      <p style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", margin: "0 0 16px" }}>{title}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>
    </div>
  );
}
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={{ display: "block", color: "#999", fontSize: 13, marginBottom: 7 }}>{label}</label>{children}</div>;
}
const INP: React.CSSProperties = { width: "100%", background: "#111", border: "1px solid #2a2a2a", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" };
const SAV: React.CSSProperties = { background: "#C8A96E", color: "#0c0c0c", border: "none", borderRadius: 10, padding: "10px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer" };
const CAN: React.CSSProperties = { background: "#1e1e1e", color: "#999", border: "1px solid #2a2a2a", borderRadius: 10, padding: "10px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer" };
