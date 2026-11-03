import { Inter, Cormorant_Garamond } from "next/font/google";
import "../globals.css";

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

/**
 * Layout for all public-facing pages (home, property detail).
 * Applies the luxury cream/brown theme + Cormorant Garamond serif.
 * Isolated from the Payload admin panel.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${inter.variable} ${cormorant.variable} min-h-screen flex flex-col bg-[#FAF6EF] text-[#1C1208] antialiased`}
    >
      {children}
    </div>
  );
}
