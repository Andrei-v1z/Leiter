import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const plex = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex",
});

export const metadata: Metadata = {
  title: "Leiter. Frische Leads. Echte Nachfrage. Mehr Chancen.",
  description:
    "Hochwertige B2B-Leads mit konkretem Beratungsbedarf. Frische Anfragen von Unternehmen, die aktiv nach einer Lösung suchen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${outfit.variable} ${cormorant.variable} ${plex.variable}`}>
      <body className="relative flex min-h-screen flex-col">
        <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.03] grain mix-blend-multiply" />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
