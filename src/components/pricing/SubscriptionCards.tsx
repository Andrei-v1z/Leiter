import { CheckoutButton } from "@/components/checkout/CheckoutButton";
import { FadeBlur } from "@/components/ui/FadeBlur";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/pricing-utils";
import type { PricingConfig, SubscriptionPlan } from "@/lib/pricing-types";

interface SubscriptionCardsProps {
  config: PricingConfig;
}

function PlanCard({ plan, featured = false }: { plan: SubscriptionPlan; featured?: boolean }) {
  return (
    <article
      className={cn(
        "flex h-full flex-col p-7 sm:p-8",
        featured ? "bg-navy text-card" : "bg-card"
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className={cn("meta", featured ? "text-brass" : "text-muted")}>{plan.name}</p>
        {plan.badge && (
          <span className={cn("meta", featured ? "text-brass" : "text-muted")}>{plan.badge}</span>
        )}
      </div>

      <p className={cn("price mt-8 text-5xl", featured ? "text-card" : "text-ink")}>
        {formatPrice(plan.monthlyPrice)}
        <span
          className={cn(
            "ml-2 font-sans text-sm tracking-normal",
            featured ? "text-card/70" : "text-muted"
          )}
        >
          / Monat
        </span>
      </p>
      <p className={cn("meta mt-3", featured ? "text-card/55" : "text-muted")}>
        {plan.includedLeads} Leads inklusive
      </p>
      <p
        className={cn(
          "mt-5 max-w-md text-[15px] leading-relaxed",
          featured ? "text-card/80" : "text-muted"
        )}
      >
        {plan.description}
      </p>

      <ul className="mt-8 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li
            key={feature}
            className={cn("flex items-start gap-3 text-sm", featured ? "text-card" : "text-ink")}
          >
            <span className={cn("mt-1.5 block h-1.5 w-1.5 shrink-0", featured ? "bg-brass" : "bg-navy")} />
            {feature}
          </li>
        ))}
      </ul>

      <div className="mt-10">
        <CheckoutButton
          kind="subscription"
          slug={plan.slug}
          variant={featured ? "on-ink" : "outline"}
          className="w-full"
          noteClassName={featured ? "text-card/45" : undefined}
        >
          {plan.cta}
        </CheckoutButton>
      </div>
    </article>
  );
}

export function SubscriptionCards({ config }: SubscriptionCardsProps) {
  const plans = config.subscriptions ?? [];

  if (plans.length === 0) return null;

  return (
    <section id="abos" className="section-padding">
      <div className="page-wrap">
        <FadeBlur className="max-w-2xl">
          <p className="eyebrow">Mitgliedschaft</p>
          <h2 className="display mt-6 text-4xl text-ink sm:text-5xl">
            Ein Abo für kontinuierliche Nachfrage.
          </h2>
          <p className="mt-6 max-w-xl text-[1.05rem] leading-[1.7] text-muted">
            Kaufe einzelne Leads, wenn du testen möchtest, oder sichere dir jeden Monat frische
            Anfragen zu besseren Konditionen.
          </p>
        </FadeBlur>

        <div className="mt-14 grid gap-px border border-line bg-line md:grid-cols-3">
          {plans.map((plan, index) => (
            <FadeBlur key={plan.slug} delay={index * 120} className="h-full">
              <PlanCard plan={plan} featured={plan.featured} />
            </FadeBlur>
          ))}
        </div>
      </div>
    </section>
  );
}
