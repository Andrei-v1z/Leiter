import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FadeBlur } from "@/components/ui/FadeBlur";
import { StockImage } from "@/components/ui/StockImage";
import { formatPrice } from "@/lib/pricing-utils";
import { stockPhotos } from "@/lib/stock-photos";
import type { PricingConfig } from "@/lib/pricing-types";

interface HeroProps {
  config: PricingConfig;
}

export function Hero({ config }: HeroProps) {
  const basePrice = config.singleLead.basePrice;

  return (
    <section className="px-5 pt-16 pb-20 sm:px-8 lg:px-12 lg:pt-28 lg:pb-32">
      <div className="page-wrap grid items-stretch gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
        <FadeBlur className="border-l border-brass/70 pl-6 sm:pl-8" immediate>
          <h1 className="display max-w-[13ch] text-[2.85rem] text-ink sm:text-6xl lg:text-[4.75rem]">
            Dein Vertrieb sollte nicht hinter Kunden herlaufen.
          </h1>

          <div className="mt-10 max-w-[38rem] space-y-4 text-[1.05rem] leading-[1.7] text-muted">
            <p>
              Unternehmen und Gründer suchen täglich nach Beratung, Fördermitteln, Digitalisierung, Finanzierung
              und Wachstum.
            </p>
            <p>Das Problem ist nicht die Nachfrage.</p>
            <p className="text-ink">
              Das Problem ist, als Berater zur richtigen Zeit davon zu erfahren.
            </p>
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
        </FadeBlur>

        <FadeBlur delay={180} className="h-full min-h-[28rem]" immediate>
          <aside className="relative h-full min-h-[28rem] overflow-hidden">
            <StockImage
              src={stockPhotos.hero.src}
              alt={stockPhotos.hero.alt}
              className="absolute inset-0"
              overlay
              priority
            />
            <div className="relative z-10 flex h-full min-h-[28rem] flex-col justify-end bg-gradient-to-t from-navy via-navy/70 to-navy/10 p-8 sm:p-10">
              <p className="meta text-brass"></p>
              <p className="display mt-4 max-w-[16ch] text-2xl leading-snug text-card sm:text-[1.75rem]">
                Leads für Berater.
              </p>
              <ul className="mt-6 grid max-w-sm grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                {[
                  "Unternehmensberatung",
                  "Fördermittel",
                  "Digitalisierung",
                  "Finanzierung",
                  "M&A",
                ].map((group) => (
                  <li key={group} className="flex items-center gap-2 text-sm text-card/80">
                    <span className="block h-px w-3 shrink-0 bg-brass" />
                    {group}
                  </li>
                ))}
              </ul>
              <div className="mt-8 border-t border-white/15 pt-6">
                <p className="meta text-card/40">ab</p>
                <p className="price mt-3 text-5xl text-card sm:text-6xl">{formatPrice(basePrice)}</p>
              </div>
            </div>
          </aside>
        </FadeBlur>
      </div>
    </section>
  );
}
