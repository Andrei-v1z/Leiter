"use client";

import { CheckoutButton } from "@/components/checkout/CheckoutButton";
import { FadeBlur } from "@/components/ui/FadeBlur";
import { formatPrice } from "@/lib/pricing-utils";
import type { PricingConfig } from "@/lib/pricing-types";

interface CategoryPricingGridProps {
  config: PricingConfig;
}

export function CategoryPricingGrid({ config }: CategoryPricingGridProps) {
  return (
    <section className="section-padding">
      <div className="page-wrap">
        <FadeBlur>
          <p className="eyebrow">Kategorien</p>
          <h2 className="display mt-6 text-4xl text-ink sm:text-5xl">Leads nach Kategorie</h2>
          <p className="mt-5 max-w-xl text-muted">
            Jeder Lead startet bei {formatPrice(config.singleLead.basePrice)}. Ab 5 Leads gilt der
            Mengenrabatt. Kein Dashboard, keine Exklusiv-Stufen. Mit dem Kauf gelten die AGB.
          </p>
        </FadeBlur>

        <FadeBlur delay={120}>
          <ul className="mt-12 divide-y divide-line border-y border-line">
            {config.categories.map((category) => (
              <li
                key={category.slug}
                className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-baseline justify-between gap-6 sm:block">
                  <span className="text-ink">{category.name}</span>
                  <span className="price text-2xl text-brass sm:ml-6">
                    ab {formatPrice(category.basePrice)}
                  </span>
                </div>
                <CheckoutButton kind="category" slug={category.slug} variant="outline" compact>
                  Lead sichern
                </CheckoutButton>
              </li>
            ))}
          </ul>
        </FadeBlur>
      </div>
    </section>
  );
}
