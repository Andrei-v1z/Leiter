import Link from "next/link";

export const metadata = {
  title: "AGB · Leiter.be",
  description:
    "Allgemeine Geschäftsbedingungen von Leiter.be. Digitale Lead-Daten, keine Rückerstattung.",
};

export default function AgbPage() {
  return (
    <article className="section-padding">
      <div className="page-wrap max-w-3xl">
        <p className="eyebrow">Rechtliches</p>
        <h1 className="display mt-5 text-4xl text-ink sm:text-5xl">
          Allgemeine Geschäftsbedingungen
        </h1>
        <p className="mt-4 text-sm text-muted">
          Diese AGB gelten für den Kauf von B2B-Lead-Daten und Mitgliedschaften auf Leiter.be.
          Stand: 2. September 2026.
        </p>

        <div className="mt-12 space-y-10 text-[1.02rem] leading-relaxed">
          <section>
            <h2 className="display text-2xl text-ink">1. Vertragspartner</h2>
            <p className="mt-4 text-muted">
              Anbieter ist Bright Pixel Advertisement Agency LLC, 1309 Coffeen Avenue STE 1200,
              Sheridan, Wyoming 82801, USA. Filing ID: 2026-002045710. E-Mail:
              support@brightpixel.agency. Leiter.be ist ein Angebot dieses Unternehmens. Siehe auch{" "}
              <a
                href="https://brightpixel.agency/"
                className="text-ink underline"
                target="_blank"
                rel="noreferrer"
              >
                brightpixel.agency
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="display text-2xl text-ink">2. Nur Unternehmer</h2>
            <p className="mt-4 text-muted">
              Leiter.be richtet sich ausschließlich an Unternehmer, Selbstständige und Freiberufler
              im Sinne des § 14 BGB bzw. vergleichbare Unternehmen. Verbraucher sind vom Kauf
              ausgeschlossen. Ein gesetzliches Widerrufsrecht für Verbraucherverträge findet keine
              Anwendung.
            </p>
          </section>

          <section>
            <h2 className="display text-2xl text-ink">3. Leistungsgegenstand</h2>
            <p className="mt-4 text-muted">
              Wir verkaufen Zugang zu aktuellen B2B-Anfragen (Leads): Kontaktdaten, Anfragebeschreibung
              und Qualitätsangaben, soweit verfügbar. Einzelläufe, Pakete, exklusive Leads und
              monatliche Abos sind digitale Datenprodukte. Leiter schuldet keinen Vertragsabschluss
              mit dem angefragten Unternehmen und keine bestimmte Abschlussquote.
            </p>
          </section>

          <section>
            <h2 className="display text-2xl text-ink">4. Vertragsschluss und Zahlung</h2>
            <p className="mt-4 text-muted">
              Der Kaufvertrag kommt zustande, wenn die Zahlung über Stripe erfolgreich autorisiert
              ist. Preise verstehen sich in Euro zuzüglich etwaiger gesetzlicher Steuern, soweit
              auszuweisen. Stripe ist Zahlungsdienstleister. Mit erfolgreicher Belastung gilt die
              Zahlung als erfüllt.
            </p>
          </section>

          <section>
            <h2 className="display text-2xl text-ink">5. Keine Rückerstattungen</h2>
            <p className="mt-4 text-muted">
              Leiter.be verkauft digitale Daten. Sobald ein Lead, ein Paket oder ein Abo-Zugang
              bereitgestellt oder einsehbar gemacht wurde, ist der wirtschaftliche Wert der Daten
              übertragen. Rückerstattungen, Gutschriften, Chargebacks ohne anerkannten Rechtsgrund
              und anteilige Erstattungen sind ausgeschlossen, auch bei Nichtnutzung, Teilnutzung,
              Meinungsänderung, Teamwechsel oder internen Budgetentscheidungen.
              <br />
              <br />
              Abonnements können für die Zukunft gekündigt werden. Eine bereits begonnene
              Abrechnungsperiode und bereits ausgegebene Leads werden nicht erstattet.
              <br />
              <br />
              Zwingende Ansprüche bei Vorsatz, arglistiger Täuschung oder nicht abdingbarer
              Haftung bleiben unberührt. Soweit gesetzlich zulässig, ersetzen wir mangelhafte
              digitale Leistungen durch erneute Bereitstellung, nicht durch Geld-Rückerstattung.
            </p>
          </section>

          <section>
            <h2 className="display text-2xl text-ink">6. Nutzung der Daten</h2>
            <p className="mt-4 text-muted">
              Erworbene Leads dürfen nur für die eigene geschäftliche Ansprache verwendet werden.
              Eine Weitergabe, ein Weiterverkauf oder eine Veröffentlichung der Kontaktdaten an
              Dritte ist untersagt, soweit nicht ausdrücklich anders vereinbart.
            </p>
          </section>

          <section>
            <h2 className="display text-2xl text-ink">7. Haftung</h2>
            <p className="mt-4 text-muted">
              Unbeschränkte Haftung für Vorsatz und grobe Fahrlässigkeit sowie nach zwingendem
              Recht. Bei leichter Fahrlässigkeit nur für Kardinalpflichten, begrenzt auf den
              vertragstypischen, vorhersehbaren Schaden. Keine Haftung für entgangenen Gewinn oder
              dafür, dass aus einem Lead ein Auftrag entsteht.
            </p>
          </section>

          <section>
            <h2 className="display text-2xl text-ink">8. Datenschutz</h2>
            <p className="mt-4 text-muted">
              Es gilt die{" "}
              <Link href="/datenschutz" className="text-ink underline">
                Datenschutzerklärung
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="display text-2xl text-ink">9. Recht und Gerichtsstand</h2>
            <p className="mt-4 text-muted">
              Es gilt das Recht des US-Bundesstaates Wyoming unter Ausschluss des UN-Kaufrechts,
              soweit keine zwingenden Vorschriften entgegenstehen. Gerichtsstand ist, soweit
              zulässig, Sheridan, Wyoming, USA.
            </p>
          </section>
        </div>
      </div>
    </article>
  );
}
