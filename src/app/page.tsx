import { getPricingConfig } from "@/lib/pricing-store";
import { Hero } from "@/components/home/Hero";
import { HomepagePriceTeaser } from "@/components/home/HomepagePriceTeaser";
import { SalesPitch } from "@/components/home/SalesPitch";
import { PremiumPositioning } from "@/components/pricing/PremiumPositioning";
import { PriceAnchoring } from "@/components/pricing/PriceAnchoring";
import { SubscriptionCards } from "@/components/pricing/SubscriptionCards";

export default async function HomePage() {
  const config = await getPricingConfig();

  return (
    <>
      <Hero config={config} />
      <HomepagePriceTeaser config={config} />
      <SubscriptionCards config={config} />
      <PremiumPositioning />
      <SalesPitch config={config} variant="short" />
      <PriceAnchoring />
      <SalesPitch config={config} variant="full" />
    </>
  );
}
