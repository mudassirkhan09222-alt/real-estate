# Meridian Reserve — International Property Investments

A high-performance, luxury real-estate investment platform: a curated marketing
frontend (hero with sticky navbar, property grid with infinite scroll, an
"Investments Protected" carousel, and an interactive dark **Yield Forecast**
calculator) plus a secure **admin CMS** for full CRUD over listings — built to
handle very high image volume without slowing down.

Built on **Next.js 16 (App Router) · React 19 · Tailwind v4 · framer-motion**, with
`sharp` upload-time image processing and `next/image` for responsive, lazy, AVIF/WebP
delivery.

> All content is brand-free and illustrative: no real names, logos, phone numbers, or
> physical addresses. Locations are generic labels backed by a dynamic region filter.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

Admin CMS: **<http://localhost:3000/admin>** · demo password: `admin`
(set `ADMIN_PASSWORD` and `AUTH_SECRET` in production — see `.env.example`).

```bash
npm run build && npm start   # production
npm run lint
```

---

## What's where (modular architecture)

Every distinct section is its own file so any piece can be edited or replaced in
isolation. UI never touches storage directly — it goes through API routes and a
repository, which keeps the high-volume swap-out (below) localized.

```
app/
  page.tsx                  Home: assembles the sections (server, request-time read)
  property/[id]/page.tsx    Property detail (static shell + streamed detail)
  admin/                    CMS: login, dashboard, properties list, new, [id] edit
  api/
    properties/             GET (paginated/filtered) · POST (create)         [public GET, authed POST]
    properties/[id]/         GET · PUT · DELETE                                [GET public, mutations authed]
    upload/                 POST multipart → sharp optimize → store          [authed]
    auth/login|logout, me/  Cookie-based admin session
components/
  layout/   Navbar.tsx · Footer.tsx
  sections/ HeroSection.tsx · PropertyGrid.tsx · PropertyCard.tsx ·
             InvestmentsProtected.tsx · YieldForecast.tsx · PropertyGallery.tsx
  ui/       OptimizedImage.tsx · AnimatedSection.tsx · SectionHeading.tsx ·
             LineChart.tsx · CitySkyline.tsx
  admin/    AdminShell.tsx · PropertyForm.tsx · ImageUploader.tsx
lib/
  db.ts        Repository (JSON file now; swap to Postgres/Mongo here)
  storage.ts   Storage adapter (local now; swap to R2/S3 here)
  images.ts    sharp pipeline: resize → WebP → blur placeholder
  auth.ts      HMAC session cookie + server-side enforcement
  types.ts · format.ts · seed.ts
```

**Decoupling hooks:** the hero search bar dispatches a `property-filter`
`CustomEvent` that `PropertyGrid` listens for, so the hero and grid share filter
state without a parent provider.

---

## Handling 100,000+ images / year

The platform is architected so the frontend never blocks on the catalogue or media
growing. The strategy is layered:

1. **Upload-time optimization (`lib/images.ts`)** — every upload is resized to
   ≤1600px, converted to **WebP** (quality 82), EXIF-rotated, and a tiny base64
   **blur placeholder** is generated. The expensive encode happens once, at upload.
2. **Delivery-time optimization (`next/image`)** — `next.config.ts` enables
   **AVIF + WebP** (AVIF preferred, WebP fallback) and sets a long `minimumCacheTTL`
   (31 days). `next/image` generates responsive `srcset` widths on demand and caches
   them, so the browser downloads only the size it needs in the most efficient format.
   `OptimizedImage` lazy-loads by default and only preloads the LCP/hero image.
3. **Pagination + infinite scroll** — `PropertyGrid` renders a server-rendered first
   page, then loads more via `IntersectionObserver` against the paginated
   `/api/properties` endpoint. No page ever renders the whole catalogue.
4. **Partitioned storage** — uploaded keys are `uploads/<YYYY>/<MM>/<uuid>.webp`, so
   no single directory ever holds hundreds of thousands of files (filesystem-slow at
   scale). The local adapter writes to `public/uploads/`; the remote adapter writes to
   object storage.
5. **Storage abstraction (`lib/storage.ts`)** — a `StorageAdapter` interface with a
   working local implementation and a documented **Cloudflare R2 / AWS S3** skeleton.
   The README in that file shows the exact swap (install `@aws-sdk/client-s3`, set
   env, return the remote adapter). CDN delivery is wired through
   `NEXT_PUBLIC_CDN_HOSTNAME` → `next/image` `remotePatterns`.

### Moving to production scale

- **Database:** `lib/db.ts` is the only module that persists listings. Re-implement
  its functions against Postgres/Mongo keeping the same signatures — nothing in the UI,
  API, or components changes. Add aggregate count endpoints for the dashboard so it
  never scans the whole table.
- **Object storage + CDN:** enable the R2/S3 adapter in `lib/storage.ts` and point
  `NEXT_PUBLIC_CDN_HOSTNAME` at the bucket/CDN URL. Put Cloudflare Images (or an S3 +
  CDN) in front so `next/image` (or a custom loader) serves optimized derivatives from
  the edge.
- **Caching:** if you switch the home page to a `use cache` scope, tag it
  `properties` and call `revalidateTag("properties", "max")` in the create/update/delete
  route handlers (the call sites are marked with comments). With `cacheComponents` on,
  uncached data already runs at request time, so the demo stays correct without it.

---

## Environment variables

See `.env.example`. All are optional for local development:

| Variable | Purpose |
| --- | --- |
| `ADMIN_PASSWORD` | CMS login password (dev default: `admin`) |
| `AUTH_SECRET` | Signs the session cookie (dev default provided) |
| `NEXT_PUBLIC_CDN_HOSTNAME` | CDN host for `next/image` remote patterns |
| `STORAGE_DRIVER` | `r2`/`s3` to use the remote adapter (else local) |
| `R2_*` | R2/S3 credentials when `STORAGE_DRIVER` is set |

---

## Notes

- The hero skyline is a hand-built SVG so it works offline with no external assets.
  Seed property imagery uses Unsplash for the demo and is fully replaceable from the
  CMS; listing data lives in `data/properties.json` (auto-seeded on first run).
- Yield Forecast figures are illustrative projections, not investment advice.
