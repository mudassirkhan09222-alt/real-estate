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
      <div className="estatio-container pt-10 pb-8">

        {/* ── Grid: Logo+CEO | Services | Docs | Invest | Address ── */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-[1.3fr_1fr_1fr_1fr_1.1fr]">

          {/* ── Col 1: Logo + CEO + Phone ── */}
          <div className="sm:col-span-2 md:col-span-1 flex flex-col items-start" style={{ gap: 0 }}>

            {/* Logo — BIGGER, no margin */}
            <Link href="/" className="inline-block">
              <div className="relative overflow-hidden" style={{ height: 260, width: 320 }}>
                <Image
                  src="/Real Logo.png"
                  alt="Warsi Jee Construction Company"
                  fill
                  className="object-contain object-left-top"
                  sizes="780px"
                />
              </div>
            </Link>

            {/* CEO — tight under logo, no extra gap */}
            <div style={{ marginTop: -20 }}>
              <p style={{ fontFamily: "var(--font-inter)", fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(28,18,8,0.4)", marginBottom: 4 }}>
                CEO &amp; Founder
              </p>
              <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.4rem", fontWeight: 700, color: "#1C1208", letterSpacing: "0.04em", marginBottom: 12, lineHeight: 1.2 }}>
                Owais Ali Warsi
              </p>

              {/* WhatsApp + Call */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <a
                  href="https://wa.me/923122249346"
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#25D366", color: "#fff", borderRadius: 20, padding: "6px 14px", fontFamily: "var(--font-inter)", fontSize: 13, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}
                  aria-label="WhatsApp"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.828L.057 23.776a.5.5 0 0 0 .614.637l6.071-1.525A11.935 11.935 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.655-.511-5.178-1.401l-.37-.22-3.833.963.98-3.77-.241-.388A9.933 9.933 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                  </svg>
                  WhatsApp
                </a>
                <a
                  href="tel:+923122249346"
                  style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#1C1208", fontFamily: "var(--font-inter)", fontSize: 14, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}
                >
                  📞 0312-2249346
                </a>
              </div>
            </div>
          </div>

          {/* ── Col 2–4: Nav columns ── */}
          <FooterCol col={SERVICES_COL} />
          <FooterCol col={DOCS_COL} />
          <FooterCol col={INVEST_COL} />

          {/* ── Col 5: Office Address (right of Invest) ── */}
          <div>
            <p style={{ fontFamily: "var(--font-inter)", fontSize: 10, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "#1C1208", marginBottom: "1rem" }}>
              OFFICE ADDRESS
            </p>
            <address className="not-italic leading-relaxed" style={{ fontFamily: "var(--font-inter)", fontSize: 13, color: "rgba(28,18,8,0.7)" }}>
              House # R-670, Shop # 4<br />
              Sharifabad,<br />
              Near Al-Sufa Masjid<br />
              Block 1, F.B. Area<br />
              <strong style={{ color: "#1C1208", fontWeight: 700, fontSize: 14, display: "block", marginTop: 4 }}>Karachi, Pakistan</strong>
            </address>
            {/* Directions link */}
            <a
              href="https://maps.google.com/?q=Sharifabad+FB+Area+Karachi"
              target="_blank"
              rel="noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 10, fontFamily: "var(--font-inter)", fontSize: 12, color: "#C8A96E", textDecoration: "none", fontWeight: 600 }}
            >
              📍 Get Directions →
            </a>
          </div>
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
