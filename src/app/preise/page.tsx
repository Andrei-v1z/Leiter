import { getPricingConfig } from "@/lib/pricing-store";
import { formatPrice } from "@/lib/pricing-utils";
import { FadeBlur } from "@/components/ui/FadeBlur";
import { SingleLeadCard } from "@/components/pricing/SingleLeadCard";
import { VolumePricing } from "@/components/pricing/VolumePricing";
import { CategoryPricingGrid } from "@/components/pricing/CategoryPricingGrid";
import { SubscriptionCards } from "@/components/pricing/SubscriptionCards";
import { PremiumPositioning } from "@/components/pricing/PremiumPositioning";
import { PriceAnchoring } from "@/components/pricing/PriceAnchoring";
import { SalesPitch } from "@/components/home/SalesPitch";

export const metadata = {
  title: "Preise · Leiter.be",
  description:
    "Leads ab 120 €. Kein Dashboard, keine Exklusiv-Pakete. Digitale Lead-Daten, keine Rückerstattung.",
};

export default async function PreisePage() {
  const config = await getPricingConfig();
  const basePrice = formatPrice(config.singleLead.basePrice);

  return (
    <>
      <section className="section-padding pb-12">
        <FadeBlur className="page-wrap max-w-3xl">
          <p className="eyebrow">Preise</p>
          <h1 className="display mt-6 max-w-[16ch] text-[2.7rem] text-ink sm:text-6xl lg:text-[4.4rem]">
            Ein guter Lead kann mehr wert sein als {basePrice}.
          </h1>
          <p className="mt-8 max-w-xl text-[1.08rem] leading-relaxed text-muted">
            Leads ab {basePrice}. Kein Dashboard, keine Exklusiv-Pakete. Digitale Lead-Daten,
            keine Rückerstattung.
          </p>
        </FadeBlur>
      </section>

      <section className="px-5 pb-8 sm:px-8 lg:px-12">
        <div className="page-wrap">
          <SingleLeadCard config={config} />
        </div>
      </section>

      <SubscriptionCards config={config} />
      <VolumePricing config={config} />
      <CategoryPricingGrid config={config} />
      <PremiumPositioning />
      <PriceAnchoring />
      <SalesPitch config={config} variant="full" />
    </>
  );
}
