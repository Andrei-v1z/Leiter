import Link from "next/link";
import { FadeBlur } from "@/components/ui/FadeBlur";

export const metadata = {
  title: "Impressum · Leiter",
  description:
    "Impressum von Leiter. Betreiber: Bright Pixel Advertisement Agency LLC, Sheridan, Wyoming.",
};

export default function ImpressumPage() {
  return (
    <article className="section-padding">
      <FadeBlur className="page-wrap max-w-3xl" immediate>
        <p className="eyebrow">Rechtliches</p>
        <h1 className="display mt-5 text-4xl text-ink sm:text-5xl">Impressum</h1>
        <p className="mt-4 text-sm text-muted">
          Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG) und § 18 Abs. 2 Medienstaatsvertrag
          (MStV). Stand: 2. September 2026.
        </p>

        <div className="mt-12 space-y-10 text-[1.02rem] leading-relaxed">
          <section>
            <h2 className="display text-2xl text-ink">1. Anbieter</h2>
            <p className="mt-4 text-muted">
              Leiter wird betrieben von:
              <br />
              <br />
              Bright Pixel Advertisement Agency LLC
              <br />
              1309 Coffeen Avenue STE 1200
              <br />
              Sheridan, Wyoming 82801
              <br />
              Vereinigte Staaten von Amerika
            </p>
          </section>

          <section>
            <h2 className="display text-2xl text-ink">2. Vertreten durch</h2>
            <p className="mt-4 text-muted">
              Manager der Bright Pixel Advertisement Agency LLC: Bright Pixel Advertisement Agency
              LLC.
              <br />
              <br />
              Registered Agent:
              <br />
              Wyoming LLC Attorney
              <br />
              1309 Coffeen Ave
              <br />
              Sheridan, WY 82801
              <br />
              <br />
              Inhaltlich und operativ verantwortlich ist Bright Pixel Advertisement Agency LLC.
            </p>
          </section>

          <section>
            <h2 className="display text-2xl text-ink">3. Kontakt</h2>
            <p className="mt-4 text-muted">
              E-Mail:{" "}
              <a href="mailto:support@brightpixel.agency" className="text-ink underline">
                support@brightpixel.agency
              </a>
              <br />
              Website des Betreibers:{" "}
              <a
                href="https://brightpixel.agency/"
                className="text-ink underline"
                target="_blank"
                rel="noreferrer"
              >
                brightpixel.agency
              </a>
            </p>
          </section>

          <section>
            <h2 className="display text-2xl text-ink">4. Registereintrag</h2>
            <p className="mt-4 text-muted">
              Rechtsform: Limited Liability Company (LLC) nach dem Recht des US-Bundesstaates
              Wyoming.
              <br />
              Registerbehörde: Wyoming Secretary of State.
              <br />
              Registernummer (Filing ID): 2026-002045710
              <br />
              <br />
              Es besteht keine deutsche Umsatzsteuer-Identifikationsnummer. Die Gesellschaft ist
              keine deutsche Firma und führt keine USt-IdNr. nach § 27a UStG.
              <br />
              <br />
              Soweit anwendbar, kann die Umsatzsteuer im Reverse-Charge-Verfahren abgewickelt
              werden.
            </p>
          </section>

          <section>
            <h2 className="display text-2xl text-ink">5. Verantwortlich für den Inhalt</h2>
            <p className="mt-4 text-muted">
              Bright Pixel Advertisement Agency LLC
              <br />
              1309 Coffeen Avenue STE 1200
              <br />
              Sheridan, Wyoming 82801
            </p>
          </section>

          <section>
            <h2 className="display text-2xl text-ink">6. Verbraucherstreitbeilegung</h2>
            <p className="mt-4 text-muted">
              Die Leistungen von Leiter richten sich an Unternehmen, Selbstständige und
              Freiberufler und nicht an Verbraucher. Wir sind nicht verpflichtet und nicht bereit,
              an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="display text-2xl text-ink">7. Haftung für Inhalte und Links</h2>
            <p className="mt-4 text-muted">
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen
              Seiten verantwortlich. Für Inhalte verlinkter Websites Dritter, darunter{" "}
              <a
                href="https://brightpixel.agency/"
                className="text-ink underline"
                target="_blank"
                rel="noreferrer"
              >
                brightpixel.agency
              </a>
              , ist der jeweilige Anbieter verantwortlich.
            </p>
          </section>

          <p className="text-sm text-muted">
            Weitere Informationen:{" "}
            <Link href="/datenschutz" className="underline">
              Datenschutzerklärung
            </Link>{" "}
            und{" "}
            <Link href="/agb" className="underline">
              AGB
            </Link>
            .
          </p>
        </div>
      </FadeBlur>
    </article>
  );
}
