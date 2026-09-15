import Link from "next/link";
import { FadeBlur } from "@/components/ui/FadeBlur";
import { StockImage } from "@/components/ui/StockImage";
import { formatPrice } from "@/lib/pricing-utils";
import { stockPhotos } from "@/lib/stock-photos";
import type { PricingConfig } from "@/lib/pricing-types";

interface HomepagePriceTeaserProps {
  config: PricingConfig;
}

export function HomepagePriceTeaser({ config }: HomepagePriceTeaserProps) {
  const basePrice = config.singleLead.basePrice;
  const featured = config.subscriptions.find((plan) => plan.featured);

  return (
    <section className="px-5 sm:px-8 lg:px-12">
      <div className="page-wrap overflow-hidden border border-line bg-navy lg:grid lg:grid-cols-[0.9fr_1.1fr]">
        <FadeBlur>
          <StockImage
            src={stockPhotos.finance.src}
            alt={stockPhotos.finance.alt}
            className="h-56 lg:h-auto"
            overlay
            sizes="(min-width: 1024px) 40vw, 100vw"
          />
        </FadeBlur>
        <div className="flex flex-col justify-between gap-12 px-5 py-12 sm:px-8 lg:flex-row lg:items-end lg:px-12 lg:py-16">
          <FadeBlur>
            <p className="eyebrow text-brass">Einzelkauf</p>
            <p className="price mt-5 text-6xl text-card sm:text-7xl lg:text-8xl">
              {formatPrice(basePrice)}
            </p>
            <p className="mt-4 max-w-xs text-sm text-card/55">
              Leads ab {formatPrice(basePrice)}. Ab 5 Leads gilt der Mengenrabatt.
            </p>
          </FadeBlur>

          {featured && (
            <FadeBlur delay={140} className="max-w-sm border-t border-white/10 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12">
              <p className="meta text-brass">Oder im Abo</p>
              <p className="price mt-4 text-4xl text-card">{formatPrice(featured.monthlyPrice)}</p>
              <p className="mt-3 text-sm text-card/55">
                {featured.includedLeads} Leads / Monat · {featured.name}
              </p>
              <Link
                href="#abos"
                className="meta mt-6 inline-block text-card underline decoration-white/20 underline-offset-4 hover:decoration-brass"
              >
                Mitgliedschaften ansehen
              </Link>
            </FadeBlur>
          )}
        </div>
      </div>
    </section>
  );
}
