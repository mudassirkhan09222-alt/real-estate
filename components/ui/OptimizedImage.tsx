import Image from "next/image";
import type { ImageProps } from "next/image";
import clsx from "clsx";

/**
 * Thin wrapper around next/image with sensible luxury defaults:
 *  - lazy loading unless `priority` (which maps to `preload` in Next.js 16)
 *  - blur-up placeholder when a `blurDataURL` is available
 *  - quality within the allowlist configured in next.config.ts
 *
 * Works in both server and client components (no "use client" needed).
 */
type OptimizedImageProps = Omit<ImageProps, "quality" | "loading" | "placeholder"> & {
  /** Treat as the LCP image: preload + eager. */
  priority?: boolean;
  quality?: 40 | 60 | 75 | 90;
};

export function OptimizedImage({
  src,
  alt,
  fill,
  width,
  height,
  blurDataURL,
  priority = false,
  quality = 75,
  sizes,
  className,
  ...rest
}: OptimizedImageProps) {
  const hasBlur = Boolean(blurDataURL);
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      quality={quality}
      sizes={sizes ?? (fill ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" : undefined)}
      preload={priority ? true : undefined}
      loading={priority ? undefined : "lazy"}
      placeholder={hasBlur ? "blur" : "empty"}
      blurDataURL={hasBlur ? blurDataURL : undefined}
      className={clsx("select-none", className)}
      {...rest}
    />
  );
}
