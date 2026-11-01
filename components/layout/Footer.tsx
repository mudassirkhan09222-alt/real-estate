import Link from "next/link";

/**
 * Brand-free footer: generic navigation, no names/phone/physical address.
 * The wordmark matches the navbar placeholder brand.
 */
export function Footer() {
  const year = new Date().getUTCFullYear();

  return (
    <footer className="bg-espresso-950 text-cream-100">
      <div className="container-luxe py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <p className="font-serif text-2xl tracking-[0.04em] text-cream-50">
              MERIDIAN <span className="text-gold-500">RESERVE</span>
            </p>
            <p className="mt-5 text-sm leading-relaxed text-cream-200/60">
              Curated international property investments with transparent yield
              forecasts and protected holdings. This is a demonstration platform;
              all listings are illustrative.
            </p>
          </div>

          <FooterCol
            title="Explore"
            links={[
              { label: "Properties", href: "#properties" },
              { label: "Protected", href: "#protected" },
              { label: "Yield Forecast", href: "#forecast" },
              { label: "Access", href: "#access" },
            ]}
          />
          <FooterCol
            title="Regions"
            links={[
              { label: "Coastal", href: "#properties" },
              { label: "Metropolitan", href: "#properties" },
              { label: "Mountain", href: "#properties" },
              { label: "Island", href: "#properties" },
            ]}
          />
          <FooterCol
            title="Platform"
            links={[
              { label: "Admin Dashboard", href: "/admin" },
              { label: "Sign In", href: "/admin/login" },
            ]}
          />
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-cream-200/10 pt-8 text-xs text-cream-200/50 sm:flex-row sm:items-center">
          <p>© {year} Meridian Reserve. Illustrative demonstration content.</p>
          <p className="max-w-md">
            Projections are estimates only and not investment advice. Past
            performance does not guarantee future results.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-gold-500">{title}</p>
      <ul className="mt-5 space-y-3">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-sm text-cream-200/70 transition-colors hover:text-cream-50">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
