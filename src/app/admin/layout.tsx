import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seite nicht gefunden · Leiter",
  robots: { index: false, follow: false },
};

export default function AdminDecoyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
