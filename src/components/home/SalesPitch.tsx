import { FadeBlur } from "@/components/ui/FadeBlur";
import { StockImage } from "@/components/ui/StockImage";
import { formatPrice } from "@/lib/pricing-utils";
import { stockPhotos } from "@/lib/stock-photos";
import type { PricingConfig } from "@/lib/pricing-types";

interface SalesPitchProps {
  config: PricingConfig;
  variant?: "full" | "short";
}

export function SalesPitch({ config, variant = "full" }: SalesPitchProps) {
  const basePrice = config.singleLead.basePrice;

  if (variant === "short") {
    return (
      <section className="section-tight">
        <div className="page-wrap grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <FadeBlur className="max-w-3xl border-l border-brass/70 pl-6 sm:pl-8">
            <blockquote className="display italic text-3xl text-ink sm:text-[2.7rem] sm:leading-[1.12]">
              Ein kalter Kontakt kostet Zeit. Ein warmer Lead kann einen Kunden bringen.
            </blockquote>
            <p className="mt-8 max-w-xl text-[1.05rem] leading-[1.7] text-muted">
              Mit Leiter erhältst du frische B2B-Anfragen von Unternehmen mit konkretem
              Beratungsbedarf.
            </p>
            <p className="meta mt-6 text-brass">
              Ab {formatPrice(basePrice)} pro Lead. Ab 5 Leads Mengenrabatt.
            </p>
          </FadeBlur>
          <FadeBlur delay={140}>
            <StockImage
              src={stockPhotos.conversation.src}
              alt={stockPhotos.conversation.alt}
              className="h-64 sm:h-80"
            />
          </FadeBlur>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding">
      <div className="page-wrap grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <FadeBlur className="max-w-3xl">
          <p className="eyebrow">Warum Leiter</p>
          <h2 className="display mt-6 text-4xl text-ink sm:text-5xl">
            Warum {formatPrice(basePrice)} für einen Lead zahlen?
          </h2>

          <div className="mt-10 space-y-5 text-[1.08rem] leading-[1.7] text-muted">
            <p>Weil du nicht für eine E-Mail-Adresse bezahlst.</p>
            <p>
              Du bezahlst dafür, dass ein Unternehmen bereits einen konkreten Bedarf geäußert hat,
              und du die Möglichkeit bekommst, genau dann Kontakt aufzunehmen, wenn dieser Bedarf
              aktuell ist.
            </p>
            <p>Leiter bringt dir frische B2B-Anfragen direkt zu dir.</p>
          </div>

          <p className="display mt-12 italic text-2xl text-ink sm:text-3xl">
            Weniger Zeit mit Kaltakquise. Mehr Zeit mit echten Interessenten.
          </p>
        </FadeBlur>
        <FadeBlur delay={140}>
          <StockImage
            src={stockPhotos.office.src}
            alt={stockPhotos.office.alt}
            className="h-72 sm:h-[28rem]"
          />
        </FadeBlur>
      </div>
    </section>
  );
}
