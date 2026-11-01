"use client";

import { useState } from "react";
import clsx from "clsx";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import type { PropertyImage } from "@/lib/types";

export function PropertyGallery({ images, title }: { images: PropertyImage[]; title: string }) {
  const [active, setActive] = useState(0);
  if (images.length === 0) {
    return <div className="grid aspect-[16/10] place-items-center rounded-2xl bg-cream-200 text-muted">No images</div>;
  }
  const current = images[active];

  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-espresso-900/8">
      <div className="relative aspect-[16/10] bg-cream-200">
        <OptimizedImage
          key={current.id}
          src={current.url}
          alt={current.alt || title}
          fill
          blurDataURL={current.blurDataURL}
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover"
        />
        {images.length > 1 ? (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-espresso-950/60 px-3 py-1 text-xs text-cream-50 backdrop-blur">
            {active + 1} / {images.length}
          </div>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === active}
              className={clsx(
                "relative aspect-[4/3] overflow-hidden rounded-lg ring-1 transition-all",
                i === active ? "ring-2 ring-gold-500" : "ring-espresso-900/8 opacity-70 hover:opacity-100",
              )}
            >
              <OptimizedImage src={img.url} alt={img.alt || title} fill blurDataURL={img.blurDataURL} sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
