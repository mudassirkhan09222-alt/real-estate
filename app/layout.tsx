import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const sans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const serif = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: "Meridian Reserve — International Property Investments",
    template: "%s | Meridian Reserve",
  },
  description:
    "A curated collection of international investment-grade real estate. Access vetted opportunities worldwide with transparent yield forecasts and protected holdings.",
  applicationName: "Meridian Reserve",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    title: "Meridian Reserve — International Property Investments",
    description:
      "Curated international property investments with transparent yield forecasts.",
    siteName: "Meridian Reserve",
  },
};

export const viewport: Viewport = {
  themeColor: "#1c1612",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sans.variable} ${serif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream-50 text-espresso-900">
        {children}
      </body>
    </html>
  );
}
