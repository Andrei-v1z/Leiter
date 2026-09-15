import { getPricingConfig } from "@/lib/pricing-store";
import { formatPrice } from "@/lib/pricing-utils";
import { FadeBlur } from "@/components/ui/FadeBlur";
import { StockImage } from "@/components/ui/StockImage";
import { SingleLeadCard } from "@/components/pricing/SingleLeadCard";
import { VolumePricing } from "@/components/pricing/VolumePricing";
import { LeadCategories } from "@/components/home/LeadCategories";
import { SubscriptionCards } from "@/components/pricing/SubscriptionCards";
import { PremiumPositioning } from "@/components/pricing/PremiumPositioning";
import { PriceAnchoring } from "@/components/pricing/PriceAnchoring";
import { SalesPitch } from "@/components/home/SalesPitch";
import { breakSentences } from "@/lib/sentences";
import { stockPhotos } from "@/lib/stock-photos";

export const metadata = {
  title: "Preise · Leiter",
  description:
    "Leads ab 80 €. Ab 5 Leads Mengenrabatt. Kein Dashboard. Jeder Lead ist exklusiv.",
};

export default async function PreisePage() {
  const config = await getPricingConfig();
  const basePrice = formatPrice(config.singleLead.basePrice);

  return (
    <>
      <section className="px-5 pt-10 sm:px-8 lg:px-12">
        <FadeBlur className="page-wrap" immediate>
          <StockImage
            src={stockPhotos.handshake.src}
            alt={stockPhotos.handshake.alt}
            className="h-56 sm:h-80 lg:h-[26rem]"
            overlay
            priority
            sizes="100vw"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/35 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 sm:p-10">
              <p className="meta text-brass">Preise</p>
              <p className="display mt-3 max-w-[16ch] text-3xl text-card sm:text-5xl">
                {breakSentences(`Leads ab ${basePrice}. Rabatt ab 5 Stück.`)}
              </p>
            </div>
          </StockImage>
        </FadeBlur>
      </section>

      <section className="px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
        <FadeBlur className="page-wrap" immediate delay={80}>
          <h1 className="display mx-auto max-w-4xl text-center text-[2.35rem] leading-[1.15] text-ink sm:text-5xl lg:text-[3.75rem]">
            Ein guter Lead kann mehr wert sein als {basePrice}.
          </h1>
        </FadeBlur>
      </section>

      <section className="px-5 pb-8 sm:px-8 lg:px-12">
        <div className="page-wrap">
          <SingleLeadCard config={config} />
        </div>
      </section>

      <SubscriptionCards config={config} />
      <VolumePricing config={config} />
      <LeadCategories />
      <PremiumPositioning />
      <PriceAnchoring basePrice={config.singleLead.basePrice} />
      <SalesPitch config={config} variant="full" />
    </>
  );
}
