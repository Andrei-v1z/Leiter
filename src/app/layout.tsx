import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-plex-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "Leiter. Frische Leads. Echte Nachfrage. Mehr Chancen.",
  description:
    "Hochwertige B2B-Leads mit konkretem Beratungsbedarf. Frische Anfragen von Unternehmen, die aktiv nach einer Lösung suchen.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body className="relative flex min-h-screen flex-col antialiased">
        <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.03] grain mix-blend-multiply" />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
