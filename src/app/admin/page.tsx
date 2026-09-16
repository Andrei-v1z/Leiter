import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Seite nicht gefunden · Leiter",
  robots: { index: false, follow: false },
};

export default function MissingPage() {
  return (
    <article className="section-padding">
      <div className="page-wrap max-w-xl">
        <p className="eyebrow">Fehler</p>
        <h1 className="display mt-5 text-4xl text-ink sm:text-5xl">Seite nicht gefunden.</h1>
        <p className="mt-6 text-muted">Diese Adresse gibt es nicht.</p>
        <p className="mt-8">
          <Link href="/" className="text-ink underline">
            Zur Startseite
          </Link>
        </p>
      </div>
    </article>
  );
}
