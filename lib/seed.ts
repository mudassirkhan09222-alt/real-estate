import type { Property, PropertyImage } from "./types";

/**
 * Demo seed catalogue. Brand-free, location-generic, and spread across the
 * dynamic region facets so the filter system has something to work with.
 * Replace freely via the admin CMS — the live store is `data/properties.json`.
 */

const UNSPLASH = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

function img(
  uid: string,
  photo: string,
  alt: string,
  w = 1600,
  h = 1067,
): PropertyImage {
  return { id: uid, url: UNSPLASH(photo, w), width: w, height: h, alt };
}

const NOW = "2026-10-15T09:00:00.000Z";

type SeedSpec = Omit<Property, "createdAt" | "updatedAt"> & {
  createdAt?: string;
  updatedAt?: string;
};

function make(p: SeedSpec): Property {
  return { createdAt: p.createdAt ?? NOW, updatedAt: p.updatedAt ?? NOW, ...p };
}

export const SEED_PROPERTIES: Property[] = [
  make({
    id: "seed-1",
    slug: "overwater-reserve-villa",
    title: "Overwater Reserve Villa",
    summary: "A private lagoon-front villa with direct water access and protected tenure.",
    description:
      "Set on a sheltered lagoon, this villa pairs architectural restraint with a setting that few holdings can match...\n\n## Investment case\n- Projected gross yield of 6.2% from a managed short-stay program\n- Protected tenure with a 99-year secure lease structure\n- Full-service management available on request\n\nThe residence opens to a horizon-edge pool and a deep-water berth, making it equally suited to private use and a vetted rental program.",
    price: 4850000,
    currency: "USD",
    region: "Coastal",
    location: "Lagoon District",
    type: "Villa",
    status: "available",
    bedrooms: 4,
    bathrooms: 5,
    areaSqft: 5200,
    yieldPercent: 6.2,
    featured: true,
    images: [
      img("seed-1-1", "photo-1512917774080-9991f1c4c750", "Villa exterior over the lagoon"),
      img("seed-1-2", "photo-1600585154340-be6161a56a0c", "Lagoon-side terrace"),
      img("seed-1-3", "photo-1600596542815-ffad4c1539a9", "Interior living space"),
    ],
  }),
  make({
    id: "seed-2",
    slug: "metropolitan-sky-penthouse",
    title: "Metropolitan Sky Penthouse",
    summary: "A full-floor penthouse above the central business district.",
    description:
      "A full-floor penthouse with 360° skyline exposure, private lift access, and a terrace designed for entertaining.\n\n## Investment case\n- Stable demand from corporate leasing in a tier-one metro\n- Low outgoings with a recently refit common area\n- Strong resale liquidity for this asset class\n\nFinishes are restrained and durable, selected for a managed rental program as much as private enjoyment.",
    price: 3200000,
    currency: "USD",
    region: "Metropolitan",
    location: "Central Business District",
    type: "Penthouse",
    status: "available",
    bedrooms: 3,
    bathrooms: 4,
    areaSqft: 3100,
    yieldPercent: 5.1,
    featured: true,
    images: [
      img("seed-2-1", "photo-1545324418-cc1a3fa10c00", "Penthouse living room"),
      img("seed-2-2", "photo-1502672260266-1c1ef2d93688", "Skyline-facing lounge"),
      img("seed-2-3", "photo-1582268611958-ebfd161ef9cf", "Open-plan interior"),
    ],
  }),
  make({
    id: "seed-3",
    slug: "alpine-glasshouse-estate",
    title: "Alpine Glasshouse Estate",
    summary: "A glass-walled mountain residence engineered for year-round comfort.",
    description:
      "Perched on a quiet ridge, this estate frames a protected valley through floor-to-ceiling glass.\n\n## Investment case\n- Seasonal managed-rental demand drives a dependable yield\n- Energy-efficient envelope keeps operating costs predictable\n- Held within a managed estate with shared security\n\nThe lower level hosts a wellness suite and a wine room oriented to the view.",
    price: 6750000,
    currency: "USD",
    region: "Mountain",
    location: "Ridge Valley",
    type: "Estate",
    status: "available",
    bedrooms: 5,
    bathrooms: 6,
    areaSqft: 7400,
    yieldPercent: 4.8,
    featured: false,
    images: [
      img("seed-3-1", "photo-1600596542815-ffad4c1539a9", "Glass-walled living room"),
      img("seed-3-2", "photo-1564013799919-ab600027ffc6", "Estate exterior in snow"),
      img("seed-3-3", "photo-1493809842364-78817add7dee", "Mountain lounge"),
    ],
  }),
  make({
    id: "seed-4",
    slug: "harbor-quay-townhouse",
    title: "Harbor Quay Townhouse",
    summary: "A restored quay-side townhouse steps from the marina promenade.",
    description:
      "A period townhouse reimagined behind a protected facade, with mooring access and a south-facing courtyard.\n\n## Investment case\n- Strong short-stay demand in a walkable harbor precinct\n- Recently refurbished systems lower near-term capex\n- Protected streetscape preserves long-term value\n\nThree floors connect via a sculptural stair, with the principal rooms oriented to the water.",
    price: 1950000,
    currency: "USD",
    region: "Metropolitan",
    location: "Harbor Quay",
    type: "Townhouse",
    status: "available",
    bedrooms: 3,
    bathrooms: 3,
    areaSqft: 2600,
    yieldPercent: 5.9,
    featured: false,
    images: [
      img("seed-4-1", "photo-1564507592333-c4600fbee63d", "Quay-side townhouse"),
      img("seed-4-2", "photo-1502672260266-1c1ef2d93688", "Restored interior"),
    ],
  }),
  make({
    id: "seed-5",
    slug: "coral-bay-residence",
    title: "Coral Bay Residence",
    summary: "An oceanfront residence with a managed rental program in place.",
    description:
      "A beachfront villa opening directly to a sheltered bay, designed for a turnkey managed-rental operation.\n\n## Investment case\n- In-place managed program currently delivering 6.8% gross yield\n- Beachfront position with limited comparable supply\n- Hurricane-rated construction and backup systems\n\nThe layout separates a guest pavilion from the main house for flexible use.",
    price: 5400000,
    currency: "USD",
    region: "Island",
    location: "Coral Bay",
    type: "Villa",
    status: "available",
    bedrooms: 5,
    bathrooms: 6,
    areaSqft: 6100,
    yieldPercent: 6.8,
    featured: true,
    images: [
      img("seed-5-1", "photo-1512917774080-9991f1c4c750", "Beachfront villa"),
      img("seed-5-2", "photo-1600585154340-be6161a56a0c", "Bay-facing terrace"),
      img("seed-5-3", "photo-1493809842364-78817add7dee", "Open interior"),
    ],
  }),
  make({
    id: "seed-6",
    slug: "dune-crest-pavilion",
    title: "Dune Crest Pavilion",
    summary: "A desert pavilion with passive-cooling design and protected views.",
    description:
      "A low-slung pavilion set into a stabilized dune field, designed around passive cooling and shaded courtyards.\n\n## Investment case\n- Higher yield tier driven by boutique resort-style rental demand\n- Low water and energy load keeps outgoings lean\n- Held on a managed plot with shared access\n\nDeep overhangs and cross-ventilation keep the interior comfortable through the hottest months.",
    price: 2650000,
    currency: "USD",
    region: "Desert",
    location: "Dune Reserve",
    type: "Villa",
    status: "available",
    bedrooms: 4,
    bathrooms: 4,
    areaSqft: 3800,
    yieldPercent: 7.2,
    featured: false,
    images: [
      img("seed-6-1", "photo-1613490493576-7fde63acd581", "Desert pavilion"),
      img("seed-6-2", "photo-1600596542815-ffad4c1539a9", "Shaded courtyard"),
    ],
  }),
  make({
    id: "seed-7",
    slug: "old-town-loft-collection",
    title: "Old Town Loft Collection",
    summary: "A pair of restored lofts in a protected heritage precinct.",
    description:
      "Two interconnected loft residences behind a protected heritage facade, sold as a single holding.\n\n## Investment case\n- Two income units on one title improve yield per dollar\n- Heritage streetscape supports stable resale value\n- Walkable location sustains consistent tenant demand\n\nOriginal timber and brickwork are preserved behind a fully modernized envelope.",
    price: 1150000,
    currency: "USD",
    region: "Metropolitan",
    location: "Old Town",
    type: "Apartment",
    status: "available",
    bedrooms: 2,
    bathrooms: 2,
    areaSqft: 1800,
    yieldPercent: 5.4,
    featured: false,
    images: [
      img("seed-7-1", "photo-1502672260266-1c1ef2d93688", "Restored loft interior"),
      img("seed-7-2", "photo-1582268611958-ebfd161ef9cf", "Open-plan loft"),
    ],
  }),
  make({
    id: "seed-8",
    slug: "vineyard-hill-estate",
    title: "Vineyard Hill Estate",
    summary: "A working-adjacent estate on a private hill above protected vines.",
    description:
      "A classical estate set above a managed vineyard, with a guest house and a private cellar.\n\n## Investment case\n- Lower yield offset by strong long-term appreciation potential\n- Land component provides a tangible value floor\n- Event-licensing potential for additional income\n\nThe grounds include formal gardens, a pool, and a climate-controlled cellar.",
    price: 8900000,
    currency: "USD",
    region: "Countryside",
    location: "Vineyard Hill",
    type: "Estate",
    status: "off-market",
    bedrooms: 6,
    bathrooms: 7,
    areaSqft: 9600,
    yieldPercent: 4.2,
    featured: false,
    images: [
      img("seed-8-1", "photo-1564013799919-ab600027ffc6", "Estate above the vineyard"),
      img("seed-8-2", "photo-1493809842364-78817add7dee", "Classical interior"),
      img("seed-8-3", "photo-1600585154340-be6161a56a0c", "Garden facade"),
    ],
  }),
  make({
    id: "seed-9",
    slug: "cliffside-terrace-home",
    title: "Cliffside Terrace Home",
    summary: "A terraced coastal home with engineered foundations and sea views.",
    description:
      "A terraced residence stepping down a sheltered cliff, engineered for stability and oriented to the horizon.\n\n## Investment case\n- Managed short-stay demand supports a steady 6.0% yield\n- Engineered foundations and survey-backed tenure\n- Limited comparable coastal supply supports value\n\nEach terrace opens to an outdoor room, culminating in a sea-edge plunge pool.",
    price: 3750000,
    currency: "USD",
    region: "Coastal",
    location: "Cliff Walk",
    type: "Villa",
    status: "available",
    bedrooms: 4,
    bathrooms: 4,
    areaSqft: 4200,
    yieldPercent: 6.0,
    featured: true,
    images: [
      img("seed-9-1", "photo-1600585154340-be6161a56a0c", "Cliffside terrace"),
      img("seed-9-2", "photo-1512917774080-9991f1c4c750", "Coastal facade"),
      img("seed-9-3", "photo-1600596542815-ffad4c1539a9", "Sea-view interior"),
    ],
  }),
];
