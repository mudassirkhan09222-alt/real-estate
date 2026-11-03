import Link from "next/link";
import Image from "next/image";

const SERVICES_COL = {
  heading: "OUR SERVICES",
  links: [
    { label: "Sale / Purchase", href: "#properties" },
    { label: "Rent & Lease", href: "#properties" },
    { label: "Property Transfer", href: "#properties" },
    { label: "Mutation & Registration", href: "#properties" },
    { label: "Property Consultancy", href: "#" },
    { label: "Construction & Repair", href: "#" },
  ],
};

const DOCS_COL = {
  heading: "LEGAL DOCUMENTATION",
  links: [
    { label: "Sale/Purchase & Rent Agreement", href: "#terms" },
    { label: "Transfer of Property Deeds", href: "#terms" },
    { label: "Attestation & Verification", href: "#terms" },
    { label: "Affidavite", href: "#terms" },
    { label: "CTC / Search Certificate", href: "#terms" },
    { label: "Duplicate File Collection", href: "#terms" },
  ],
};

const INVEST_COL = {
  heading: "INVEST",
  links: [
    { label: "Yield Forecast", href: "#forecast" },
    { label: "Rental Income", href: "#" },
    { label: "Capital Growth", href: "#" },
    { label: "Investor Guide", href: "#" },
    { label: "New Listings", href: "#properties" },
  ],
};

export function Footer() {
  return (
    <footer
      id="contact"
      style={{ backgroundColor: "#FAF6EF", borderTop: "1px solid rgba(28,18,8,0.1)" }}
    >
      <div className="estatio-container pt-14 pb-8">

        {/* ── Grid: Logo left + 3 columns right ── */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr]">

          {/* ── Brand block LEFT ── */}
          <div className="sm:col-span-2 md:col-span-1 flex flex-col items-center gap-5">

            {/* Logo — bigger, centered */}
            <Link href="/" className="inline-block -mt-6">
              <div className="relative h-40 w-64 overflow-hidden">
                <Image
                  src="/Real_state_Logo.png"
                  alt="Warsi Jee Construction Company"
                  fill
                  className="object-contain object-center"
                  sizes="256px"
                />
              </div>
            </Link>

            {/* CEO — centered */}
            <div className="text-center">
              <p style={{ fontFamily: "var(--font-inter)", fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(28,18,8,0.4)", marginBottom: "4px" }}>
                CEO &amp; Founder
              </p>
              <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.15rem", fontWeight: 600, color: "#1C1208", letterSpacing: "0.04em" }}>
                Owais Ali Warsi
              </p>
            </div>

            {/* Office address — centered */}
            <div className="text-center">
              <p style={{ fontFamily: "var(--font-inter)", fontSize: 10, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(28,18,8,0.4)", marginBottom: "6px" }}>
                Office Address
              </p>
              <address className="not-italic leading-relaxed" style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "rgba(28,18,8,0.65)" }}>
                House # R-670, Shop # 4<br />
                Sharifabad, Near Al-Sufa Masjid<br />
                Block 1, F.B. Area<br />
                <strong style={{ color: "#1C1208", fontWeight: 600 }}>Karachi, Pakistan</strong>
              </address>
            </div>
          </div>

          {/* ── 3 nav columns ── */}
          <FooterCol col={SERVICES_COL} />
          <FooterCol col={DOCS_COL} />
          <FooterCol col={INVEST_COL} />
        </div>

        {/* ── Divider ── */}
        <div style={{ height: 1, background: "rgba(28,18,8,0.1)", margin: "2.5rem 0 1.5rem" }} />

        {/* ── Bottom bar ── */}
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "rgba(28,18,8,0.45)", letterSpacing: "0.08em" }}>
            © 2026 Warsi Jee Construction Company. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["PRIVACY POLICY", "TERMS OF USE"].map((t) => (
              <a
                key={t}
                href="#terms"
                style={{ fontFamily: "var(--font-inter)", fontSize: 11, color: "rgba(28,18,8,0.45)", letterSpacing: "0.1em", textTransform: "uppercase" }}
                className="transition-colors hover:text-[#1C1208]"
              >
                {t}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ col }: { col: { heading: string; links: { label: string; href: string }[] } }) {
  return (
    <div>
      <p style={{ fontFamily: "var(--font-inter)", fontSize: 10, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "#1C1208", marginBottom: "1rem" }}>
        {col.heading}
      </p>
      <ul className="space-y-2.5">
        {col.links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              style={{ fontFamily: "var(--font-inter)", fontSize: 12, color: "rgba(28,18,8,0.55)", letterSpacing: "0.06em" }}
              className="transition-colors hover:text-[#1C1208]"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
