import { FadeBlur } from "@/components/ui/FadeBlur";

const highlights = [
  {
    n: "01",
    title: "Aktualität",
    text: "Die Anfrage ist frisch. Dein Vorteil ist Zeit, nicht eine längere Liste.",
  },
  {
    n: "02",
    title: "Relevanz",
    text: "Branche, Standort und Bedarf sind sichtbar, bevor du kaufst.",
  },
  {
    n: "03",
    title: "Klarheit",
    text: "Du kaufst die Anfrage und den Kontakt. Kein Dashboard, keine versteckten Stufen.",
  },
  {
    n: "04",
    title: "Intent",
    text: "Ein Unternehmen hat Bedarf geäußert. Das ist der Unterschied zur Kaltakquise.",
  },
  {
    n: "05",
    title: "Endgültig",
    text: "Digitale Lead-Daten sind nicht erstattungsfähig. Der Kauf ist verbindlich.",
  },
];

export function PremiumPositioning() {
  return (
    <section className="section-padding">
      <div className="page-wrap grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <FadeBlur className="lg:sticky lg:top-28">
          <p className="eyebrow">Positionierung</p>
          <h2 className="display mt-6 max-w-[14ch] text-4xl text-ink sm:text-5xl">
            Keine Kontaktliste. Eine Geschäftschance.
          </h2>

          <div className="mt-10 max-w-md space-y-5 text-[1.05rem] leading-[1.7] text-muted">
            <p>Leiter verkauft keine anonymen Datensätze und keine alten Firmenlisten.</p>
            <p>
              Wir konzentrieren uns auf konkrete Anfragen von Unternehmen mit einem aktuellen
              Beratungsbedarf.
            </p>
          </div>
        </FadeBlur>

        <ol className="divide-y divide-line border-y border-line">
          {highlights.map((item, index) => (
            <li key={item.n}>
              <FadeBlur delay={index * 80} className="grid grid-cols-[3.5rem_1fr] gap-6 py-6 sm:gap-8">
                <span className="meta pt-1 text-brass">{item.n}</span>
                <div>
                  <p className="display text-2xl text-ink">{item.title}</p>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{item.text}</p>
                </div>
              </FadeBlur>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
