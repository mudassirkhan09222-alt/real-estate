"use client";
import { useState, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Img { id?: number; filePath: string; }

interface Props {
  mode: "create" | "edit";
  initial?: {
    id?: number; title?: string; description?: string; price?: number;
    location?: string; status?: string; availability?: string; images?: Img[];
  };
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "14px 22px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
        <p style={{ color: "#475569", fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", margin: 0 }}>{title}</p>
      </div>
      <div style={{ padding: "22px", display: "flex", flexDirection: "column", gap: 18 }}>{children}</div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", color: "#374151", fontSize: 13, fontWeight: 600, marginBottom: 7 }}>
        {label}{required && <span style={{ color: "#ef4444", marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const INP: React.CSSProperties = {
  width: "100%", background: "#fff", border: "1px solid #d1d5db",
  borderRadius: 8, padding: "9px 12px", color: "#0f172a", fontSize: 14,
  outline: "none", boxSizing: "border-box",
  transition: "border-color .15s",
};

// Vercel rejects any request body over 4.5 MB (413 FUNCTION_PAYLOAD_TOO_LARGE)
// before our API code runs, so photos are shrunk in the browser first and sent
// in batches that each stay well under that limit.
const MAX_BATCH_BYTES    = 3.5 * 1024 * 1024;
const MAX_PHOTO_BYTES    = 4 * 1024 * 1024;
const MAX_SIDE           = 1920;            // the server resizes to this anyway (lib/upload.ts)
const SHRINK_ABOVE_BYTES = 1024 * 1024;

interface Pending { file: File; preview: string; }
interface Prepared extends Pending { upload: File; }
interface SavedProperty { id: number; images?: Img[]; }

const mb = (bytes: number) => (bytes / 1024 / 1024).toFixed(1);

/** Shrink a photo to ≤1920px JPEG in the browser; returns the original when it can't or needn't be shrunk. */
async function shrinkPhoto(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp|bmp|avif)$/.test(file.type)) return file; // GIF, SVG, HEIC…: send as is
  const url = URL.createObjectURL(file);
  try {
    const img = new window.Image();
    img.src = url;
    await img.decode();
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    if (scale === 1 && file.size <= SHRINK_ABOVE_BYTES) return file;
    const canvas = document.createElement("canvas");
    canvas.width  = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.fillStyle = "#fff";                       // JPEG has no transparency
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>(done => canvas.toBlob(done, "image/jpeg", 0.85));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;                                  // browser can't decode it; let the server try
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Group photos so each request stays under MAX_BATCH_BYTES. */
function toBatches(items: Prepared[]): Prepared[][] {
  const batches: Prepared[][] = [];
  let current: Prepared[] = [];
  let size = 0;
  for (const item of items) {
    if (current.length && size + item.upload.size > MAX_BATCH_BYTES) {
      batches.push(current); current = []; size = 0;
    }
    current.push(item); size += item.upload.size;
  }
  if (current.length) batches.push(current);
  return batches;
}

/** Send one save request. Throws a readable Error; Vercel's own errors (e.g. 413) are plain text, not JSON. */
async function send(url: string, method: "POST" | "PUT", body: FormData): Promise<SavedProperty> {
  let r: Response;
  try {
    r = await fetch(url, { method, body });
  } catch {
    throw new Error("Network error. Check your internet connection and try again.");
  }
  const text = await r.text();
  let data: unknown = null;
  try { data = JSON.parse(text); } catch { /* not JSON */ }
  const obj = data && typeof data === "object" ? data as Record<string, unknown> : null;
  if (r.ok && obj && "id" in obj) return obj as unknown as SavedProperty;
  if (obj && typeof obj.error === "string") throw new Error(obj.error);
  if (r.status === 413) throw new Error("The photos are too large to upload. Try fewer or smaller photos.");
  if (r.status === 401) throw new Error("Your session has expired. Please sign in again.");
  throw new Error(`Save failed (server error ${r.status}). Please try again.`);
}

export default function PropertyForm({ mode, initial }: Props) {
  const router = useRouter();
  const [title,       setTitle]       = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price,       setPrice]       = useState(String(initial?.price ?? ""));
  const [location,    setLocation]    = useState(initial?.location ?? "");
  const [status,      setStatus]      = useState(initial?.status ?? "draft");
  const [availability, setAvailability] = useState(initial?.availability ?? "available");
  const [images,      setImages]      = useState<Img[]>(initial?.images ?? []);
  const [removedIds,  setRemovedIds]  = useState<number[]>([]);
  const [pending,     setPending]     = useState<Pending[]>([]);
  // Set once the product exists, so a retry after a failed photo batch updates it instead of creating a duplicate.
  const [savedId,     setSavedId]     = useState<number | undefined>(initial?.id);
  const [saving,      setSaving]      = useState(false);
  const [progress,    setProgress]    = useState("");
  const [error,       setError]       = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setPending(prev => [...prev, ...files.map(file => ({ file, preview: URL.createObjectURL(file) }))]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeExisting(id: number) {
    setImages(prev => prev.filter(i => i.id !== id));
    setRemovedIds(prev => [...prev, id]);
  }
  function removeNew(idx: number) {
    URL.revokeObjectURL(pending[idx].preview);
    setPending(prev => prev.filter((_, i) => i !== idx));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (saving) return;
    setError(""); setSaving(true);

    let id        = savedId;
    let removeIds = removedIds;
    let left      = pending;
    let savedSome = false;
    try {
      setProgress(left.length ? "Preparing photos…" : "Saving…");
      const prepared: Prepared[] = await Promise.all(left.map(async p => ({ ...p, upload: await shrinkPhoto(p.file) })));
      const tooBig = prepared.find(p => p.upload.size > MAX_PHOTO_BYTES);
      if (tooBig) {
        throw new Error(`"${tooBig.file.name}" is too large to upload (${mb(tooBig.upload.size)} MB) and couldn't be shrunk. Please use a JPG or PNG photo under 4 MB.`);
      }

      const batches = toBatches(prepared);
      if (!batches.length) batches.push([]);          // no new photos: still save the details

      for (let b = 0; b < batches.length; b++) {
        setProgress(batches.length > 1 ? `Uploading photos ${b + 1}/${batches.length}…`
                  : batches[b].length ? "Uploading photos…" : "Saving…");
        const form = new FormData();
        form.set("title",        title);
        form.set("description",  description);
        form.set("price",        price);
        form.set("location",     location);
        form.set("status",       status);
        form.set("availability", availability);
        if (removeIds.length) form.set("remove_image_ids", removeIds.join(","));
        for (const p of batches[b]) form.append("images", p.upload, p.upload.name);

        const saved = await send(
          id == null ? "/api/admin/properties" : `/api/admin/properties/${id}`,
          id == null ? "POST" : "PUT",
          form,
        );

        // Record what is saved so a retry only sends what's left.
        id = saved.id; removeIds = []; savedSome = true;
        const sent = new Set(batches[b].map(p => p.preview));
        sent.forEach(u => URL.revokeObjectURL(u));
        left = left.filter(p => !sent.has(p.preview));
        setSavedId(id); setRemovedIds([]); setImages(saved.images ?? []); setPending(left);
      }

      router.push("/admin/products"); router.refresh();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const button = mode === "edit" ? "Save Changes" : "Create Product";
      setError(savedSome && left.length
        ? `The product was saved, but ${left.length} photo${left.length === 1 ? "" : "s"} did not upload: ${msg} Press "${button}" again to retry.`
        : msg);
      setSaving(false); setProgress("");
    }
  }

  const allPreviews = [
    ...images.map(i => ({ src: i.filePath, onRemove: () => removeExisting(i.id!), isBlob: false })),
    ...pending.map((p, i) => ({ src: p.preview, onRemove: () => removeNew(i), isBlob: true })),
  ];

  return (
    <form onSubmit={onSubmit}>
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ color: "#0f172a", fontSize: 24, fontWeight: 700, margin: "0 0 4px", letterSpacing: "-0.02em" }}>
            {mode === "edit" ? "Edit Product" : "Add New Product"}
          </h1>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
            {mode === "edit" ? "Update listing details and images." : "Fill in the details to create a new listing."}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button type="button" onClick={() => router.back()} style={{
            background: "#fff", color: "#475569", border: "1px solid #d1d5db",
            borderRadius: 9, padding: "10px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer",
          }}>Cancel</button>
          <button type="submit" disabled={saving} style={{
            background: "#1e2a3b", color: "#fff", border: "none",
            borderRadius: 9, padding: "10px 22px", fontWeight: 600, fontSize: 14, cursor: "pointer",
            opacity: saving ? 0.7 : 1,
          }}>{saving ? (progress || "Saving…") : mode === "edit" ? "Save Changes" : "Create Product"}</button>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 9, padding: "12px 16px", color: "#dc2626", fontSize: 14, marginBottom: 20 }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card title="Product Details">
            <Field label="Title" required>
              <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. 3-Bedroom House in DHA Phase 6" style={INP} />
            </Field>
            <Field label="Description">
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={6} placeholder="Full description of the property…" style={{ ...INP, resize: "vertical" }} />
            </Field>
            <Field label="Location">
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="DHA Phase 6, Karachi" style={INP} />
            </Field>
          </Card>

          <Card title="Images">
            <div
              style={{ border: "2px dashed #d1d5db", borderRadius: 10, padding: "28px 20px", textAlign: "center", cursor: "pointer", background: "#f8fafc" }}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={onFileChange} />
              <div style={{ fontSize: 28, marginBottom: 8 }}>📸</div>
              <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 4px", fontWeight: 500 }}>Click to upload images</p>
              <p style={{ color: "#94a3b8", fontSize: 12, margin: 0 }}>PNG, JPG, WebP up to 25MB each — auto-converted to WebP</p>
            </div>

            {allPreviews.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(100px,1fr))", gap: 10, marginTop: 4 }}>
                {allPreviews.map(({ src, onRemove, isBlob }, i) => (
                  <div key={i} style={{ position: "relative", borderRadius: 8, overflow: "hidden", aspectRatio: "4/3", background: "#f1f5f9" }}>
                    <Image src={src} alt="" fill style={{ objectFit: "cover" }} sizes="120px" unoptimized={isBlob} />
                    {i === 0 && (
                      <span style={{ position: "absolute", bottom: 4, left: 4, background: "#1e2a3b", color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 4, padding: "2px 6px", letterSpacing: "0.06em" }}>COVER</span>
                    )}
                    <button type="button" onClick={onRemove} style={{
                      position: "absolute", top: 4, right: 4, background: "#ef4444", color: "#fff",
                      border: "none", borderRadius: "50%", width: 22, height: 22,
                      cursor: "pointer", fontSize: 12, display: "grid", placeItems: "center", fontWeight: 700,
                    }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Card title="Pricing">
            <Field label="Price (PKR)">
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0" min={0} style={INP} />
            </Field>
          </Card>

          <Card title="Availability">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { value: "available", label: "Available",  desc: "Listing is active for sale / rent", dot: "#22c55e" },
                { value: "sold_out",  label: "Sold Out",   desc: "Property has been sold",            dot: "#ef4444" },
              ].map(opt => (
                <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 14px", borderRadius: 8, border: `1px solid ${availability === opt.value ? "#1e2a3b" : "#e2e8f0"}`, background: availability === opt.value ? "#f8fafc" : "#fff" }}>
                  <input type="radio" name="availability" value={opt.value} checked={availability === opt.value} onChange={() => setAvailability(opt.value)} style={{ accentColor: "#1e2a3b" }} />
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: opt.dot, flexShrink: 0, display: "inline-block" }} />
                  <span>
                    <strong style={{ color: "#0f172a", fontSize: 14, display: "block", fontWeight: 600 }}>{opt.label}</strong>
                    <span style={{ color: "#64748b", fontSize: 12 }}>{opt.desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </Card>

          <Card title="Status">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["draft", "published"].map(s => (
                <label key={s} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "10px 14px", borderRadius: 8, border: `1px solid ${status === s ? "#1e2a3b" : "#e2e8f0"}`, background: status === s ? "#f8fafc" : "#fff" }}>
                  <input type="radio" name="status" value={s} checked={status === s} onChange={() => setStatus(s)} style={{ accentColor: "#1e2a3b" }} />
                  <span>
                    <strong style={{ color: "#0f172a", fontSize: 14, display: "block", fontWeight: 600 }}>
                      {s === "published" ? "Published" : "Draft"}
                    </strong>
                    <span style={{ color: "#64748b", fontSize: 12 }}>
                      {s === "published" ? "Visible on public site" : "Hidden from public"}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
