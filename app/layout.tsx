import type { Metadata } from "next";
export const metadata: Metadata = {
  title: { default: "Warsi Jee Construction", template: "%s | Warsi Jee Construction" },
  description: "Warsi Real Estate Agency — Sale, Purchase, Rent, Construction in Karachi.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
