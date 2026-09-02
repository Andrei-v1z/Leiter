export function PriceAnchoring() {
  const classic = [
    "Kaltakquise",
    "Listen kaufen",
    "E-Mails schreiben",
    "Follow-ups",
    "Viele Kontakte ohne konkreten Bedarf",
  ];

  const leiter = [
    "Aktuelle Anfrage",
    "Konkreter Bedarf",
    "Lead-Alter sichtbar",
    "Qualitätsindikatoren",
    "Direkter Kontakt",
  ];

  return (
    <section className="section-padding">
      <div className="page-wrap">
        <p className="eyebrow">Vergleich</p>
        <h2 className="display mt-6 max-w-[16ch] text-4xl text-ink sm:text-5xl">
          Bezahle nicht für mehr Kontakte. Bezahle für bessere Chancen.
        </h2>

        <div className="mt-14 grid md:grid-cols-[1fr_1.15fr]">
          <div className="border border-line p-8 md:border-r-0 md:p-10">
            <p className="meta text-muted">Klassische Akquise</p>
            <ul className="mt-8 space-y-4">
              {classic.map((item) => (
                <li key={item} className="flex items-start gap-3 text-muted">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 bg-line" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-navy p-8 text-card md:p-10">
            <p className="meta text-brass">Leiter</p>
            <ul className="mt-8 space-y-4">
              {leiter.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 bg-brass" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
