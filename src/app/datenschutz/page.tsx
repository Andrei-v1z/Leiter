import Link from "next/link";
import { FadeBlur } from "@/components/ui/FadeBlur";

export const metadata = {
  title: "Datenschutzerklärung · Leiter.be",
  description:
    "Datenschutzerklärung von Leiter.be. Verantwortlicher: Bright Pixel Advertisement Agency LLC.",
};

export default function DatenschutzPage() {
  return (
    <article className="section-padding">
      <FadeBlur className="page-wrap max-w-3xl" immediate>
        <p className="eyebrow">Rechtliches</p>
        <h1 className="display mt-5 text-4xl text-ink sm:text-5xl">Datenschutzerklärung</h1>
        <p className="mt-4 text-sm text-muted">
          Diese Erklärung informiert über die Verarbeitung personenbezogener Daten auf Leiter.be.
          Stand: 2. September 2026.
        </p>

        <div className="mt-12 space-y-10 text-[1.02rem] leading-relaxed">
          <section>
            <h2 className="display text-2xl text-ink">1. Verantwortlicher</h2>
            <p className="mt-4 text-muted">
              Bright Pixel Advertisement Agency LLC
              <br />
              1309 Coffeen Avenue STE 1200
              <br />
              Sheridan, Wyoming 82801
              <br />
              Vereinigte Staaten von Amerika
              <br />
              E-Mail:{" "}
              <a href="mailto:privacy@brightpixel.agency" className="text-ink underline">
                privacy@brightpixel.agency
              </a>
              <br />
              Betreiber-Website:{" "}
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
            <h2 className="display text-2xl text-ink">2. Kontakt in Datenschutzfragen</h2>
            <p className="mt-4 text-muted">
              Für Auskunft, Berichtigung, Löschung oder Widerspruch: privacy@brightpixel.agency.
              Ein betrieblicher Datenschutzbeauftragter ist derzeit nicht bestellt.
            </p>
          </section>

          <section>
            <h2 className="display text-2xl text-ink">3. Welche Daten wir verarbeiten</h2>
            <p className="mt-4 text-muted">
              Beim Besuch der Website fallen technische Nutzungsdaten an (IP-Adresse, Zeitpunkt,
              aufgerufene Seite, Browsertyp). Beim Kauf über Stripe verarbeiten wir die für den
              Vertrag erforderlichen Angaben: Name, E-Mail-Adresse, Rechnungsadresse sowie
              Zahlungsstatus. Zahlungskartendaten werden von Stripe verarbeitet, nicht auf unseren
              Servern gespeichert.
            </p>
          </section>

          <section>
            <h2 className="display text-2xl text-ink">4. Zwecke und Rechtsgrundlagen</h2>
            <p className="mt-4 text-muted">
              Betrieb und Sicherheit der Website: Art. 6 Abs. 1 lit. f DSGVO. Kauf, Lieferung
              digitaler Lead-Daten und Abwicklung von Abonnements: Art. 6 Abs. 1 lit. b DSGVO.
              Gesetzliche Aufbewahrung: Art. 6 Abs. 1 lit. c DSGVO.
            </p>
          </section>

          <section>
            <h2 className="display text-2xl text-ink">5. Stripe</h2>
            <p className="mt-4 text-muted">
              Zahlungen laufen über Stripe Payments Europe, Ltd. bzw. Stripe, Inc. Stripe erhält
              die für die Zahlung nötigen Daten und kann diese in den USA verarbeiten. Weitere
              Informationen: die Datenschutzerklärung von Stripe. Rechtsgrundlage der Übermittlung
              ist die Vertragserfüllung sowie, soweit erforderlich, geeignete Garantien nach Art.
              46 DSGVO.
            </p>
          </section>

          <section>
            <h2 className="display text-2xl text-ink">6. Verkauf digitaler Lead-Daten</h2>
            <p className="mt-4 text-muted">
              Leiter.be vermittelt und verkauft qualifizierte B2B-Anfragen an Beratungsunternehmen.
              Nach erfolgreicher Zahlung erhalten Sie Zugang zu den erworbenen Kontaktdaten und
              Anfrageinhalten. Es handelt sich um digitale Daten. Eine Rückgabe oder
              Rückerstattung ist ausgeschlossen, weil die Daten mit der Bereitstellung offengelegt
              werden und ihren wirtschaftlichen Wert verlieren. Details stehen in den{" "}
              <Link href="/agb" className="text-ink underline">
                AGB
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="display text-2xl text-ink">7. Drittlandtransfer</h2>
            <p className="mt-4 text-muted">
              Der Verantwortliche hat seinen Sitz in den USA. Daten können daher in den USA
              zugänglich sein. Soweit keine Angemessenheitsentscheidung greift, stützen wir die
              Übermittlung auf Vertragserfüllung, Einwilligung oder Standardvertragsklauseln.
            </p>
          </section>

          <section>
            <h2 className="display text-2xl text-ink">8. Speicherdauer</h2>
            <p className="mt-4 text-muted">
              Bestell- und Rechnungsdaten speichern wir für die Dauer gesetzlicher
              Aufbewahrungsfristen. Technische Logs nur so lange, wie es für Sicherheit und
              Betrieb erforderlich ist.
            </p>
          </section>

          <section>
            <h2 className="display text-2xl text-ink">9. Ihre Rechte</h2>
            <p className="mt-4 text-muted">
              Sie haben Rechte auf Auskunft, Berichtigung, Löschung, Einschränkung,
              Datenübertragbarkeit und Widerspruch sowie ein Beschwerderecht bei einer
              Aufsichtsbehörde (Art. 15-21, 77 DSGVO).
            </p>
          </section>

          <section>
            <h2 className="display text-2xl text-ink">10. Cookies</h2>
            <p className="mt-4 text-muted">
              Für den Betrieb der Website setzen wir technisch notwendige Cookies ein. Beim Kauf
              kann Stripe eigene Cookies und Speichertechniken nutzen, um die Zahlung abzusichern.
            </p>
          </section>
        </div>
      </FadeBlur>
    </article>
  );
}
