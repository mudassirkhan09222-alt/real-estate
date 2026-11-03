import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: "ESTATIO — Invest Internationally Today",
    template: "%s | ESTATIO",
  },
  description:
    "Access verified premium international property investments with transparent financial projections, legal support, and secured transactions.",
  applicationName: "ESTATIO",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#1C1208",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#FAF6EF] text-[#1C1208] antialiased">
        {children}
      </body>
    </html>
  );
}
