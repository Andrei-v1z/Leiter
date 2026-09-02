import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/pricing-utils";
import type { PricingConfig } from "@/lib/pricing-types";

interface HeroProps {
  config: PricingConfig;
}

export function Hero({ config }: HeroProps) {
  const basePrice = config.singleLead.basePrice;

  return (
    <section className="px-5 pt-16 pb-20 sm:px-8 lg:px-12 lg:pt-28 lg:pb-32">
      <div className="page-wrap grid items-end gap-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="border-l border-brass/70 pl-6 sm:pl-8">
          <p className="eyebrow">Dossier 01 · Nachfrage</p>
          <h1 className="display mt-8 max-w-[13ch] text-[2.85rem] text-ink sm:text-6xl lg:text-[4.75rem]">
            Dein Vertrieb sollte nicht hinter Kunden herlaufen.
          </h1>

          <div className="mt-10 max-w-[38rem] space-y-4 text-[1.05rem] leading-[1.7] text-muted">
            <p>
              Unternehmen suchen täglich nach Beratung, Fördermitteln, Digitalisierung, Finanzierung
              und Wachstum.
            </p>
            <p>Das Problem ist nicht die Nachfrage.</p>
            <p className="text-ink">Das Problem ist, zur richtigen Zeit davon zu erfahren.</p>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-8">
            <Button href="/preise">Leads entdecken</Button>
            <Link
              href="#abos"
              className="meta text-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
            >
              Mitgliedschaften
            </Link>
          </div>
        </div>

        <aside className="ink-panel relative p-8 sm:p-10">
          <p className="meta text-brass">Was Leiter löst</p>
          <div className="mt-8 space-y-5 text-[15px] leading-relaxed text-card/70">
            <p>Aktuelle B2B-Anfragen, zusammengeführt mit spezialisierten Beratern.</p>
            <p>
              Du siehst, was gesucht wird, wie frisch die Anfrage ist und wie relevant sie für dich
              ist.
            </p>
            <p className="text-card">Dann entscheidest du, welchen Lead du kaufst.</p>
          </div>
          <div className="mt-10 border-t border-white/10 pt-8">
            <p className="meta text-card/40">ab</p>
            <p className="price mt-3 text-5xl text-card sm:text-6xl">{formatPrice(basePrice)}</p>
            <p className="mt-3 text-sm text-card/50">pro Lead. Mengenrabatte im Paket.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
