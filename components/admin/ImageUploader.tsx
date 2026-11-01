"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Star, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import type { PropertyImage } from "@/lib/types";

/**
 * Multi-image uploader. Files are POSTed to /api/upload, which runs the sharp
 * pipeline (resize + WebP + blur placeholder) and returns ready-to-use image
 * records. The cover image is images[0]; reorder with arrows, remove with the
 * trash button. The parent form owns the final array.
 */
export function ImageUploader({
  images,
  onChange,
}: {
  images: PropertyImage[];
  onChange: (images: PropertyImage[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      for (const f of Array.from(files)) form.append("files", f);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Upload failed");
      onChange([...images, ...(data.images as PropertyImage[])]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const remove = (id: string) => onChange(images.filter((i) => i.id !== id));
  const move = (index: number, dir: -1 | 1) => {
    const next = [...images];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };
  const makeCover = (index: number) => {
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    onChange(next);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-espresso-700">
          Images <span className="text-muted">({images.length})</span>
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-full border border-espresso-900/10 px-4 py-2 text-sm text-espresso-800 transition-colors hover:bg-cream-100 disabled:opacity-50"
        >
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
          {uploading ? "Optimizing…" : "Add images"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
      </div>

      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

      <p className="mt-2 text-xs text-muted">
        Uploaded images are resized to ≤1600px and converted to WebP automatically.
        The first image is the cover.
      </p>

      {images.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-4 grid h-40 w-full place-items-center rounded-xl border-2 border-dashed border-espresso-900/10 text-sm text-muted transition-colors hover:border-gold-500 hover:text-espresso-700"
        >
          {uploading ? <Loader2 className="animate-spin" /> : "Click to upload property images"}
        </button>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((img, i) => (
            <div key={img.id} className="group relative overflow-hidden rounded-xl ring-1 ring-espresso-900/8">
              <div className="relative aspect-[4/3] bg-cream-200">
                <OptimizedImage src={img.url} alt={img.alt} fill blurDataURL={img.blurDataURL} sizes="200px" className="object-cover" />
              </div>
              <div className="absolute left-2 top-2 flex gap-1">
                {i === 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gold-500 px-2 py-1 text-[10px] font-medium text-espresso-950">
                    <Star size={11} /> Cover
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => makeCover(i)}
                    className="rounded-full bg-espresso-950/60 p-1.5 text-cream-50 backdrop-blur transition-colors hover:bg-gold-500 hover:text-espresso-950"
                    aria-label="Set as cover"
                  >
                    <Star size={12} />
                  </button>
                )}
              </div>
              <div className="absolute right-2 top-2 flex gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  className="rounded-full bg-espresso-950/60 p-1.5 text-cream-50 backdrop-blur transition-colors hover:bg-espresso-900 disabled:opacity-30"
                  aria-label="Move left"
                >
                  <ChevronLeft size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === images.length - 1}
                  className="rounded-full bg-espresso-950/60 p-1.5 text-cream-50 backdrop-blur transition-colors hover:bg-espresso-900 disabled:opacity-30"
                  aria-label="Move right"
                >
                  <ChevronRight size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => remove(img.id)}
                  className="rounded-full bg-espresso-950/60 p-1.5 text-cream-50 backdrop-blur transition-colors hover:bg-red-500"
                  aria-label="Remove image"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
