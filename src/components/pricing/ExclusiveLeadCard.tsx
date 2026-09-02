"use client";

import { CheckoutButton } from "@/components/checkout/CheckoutButton";
import { formatPrice } from "@/lib/pricing-utils";
import type { PricingConfig } from "@/lib/pricing-types";

interface ExclusiveLeadCardProps {
  config: PricingConfig;
}

export function ExclusiveLeadCard({ config }: ExclusiveLeadCardProps) {
  const { exclusive } = config;
  const example = exclusive.exampleLead;

  return (
    <section id="exklusiv" className="section-padding">
      <div className="page-wrap grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="eyebrow">Premium</p>
          <h2 className="display mt-6 text-4xl text-ink sm:text-5xl">Exklusive Leads</h2>
          <blockquote className="display mt-8 italic text-2xl text-ink sm:text-3xl">
            Der Lead gehört nur dir.
          </blockquote>
          <p className="mt-8 max-w-lg leading-relaxed text-muted">
            Ab {formatPrice(exclusive.basePrice)} pro Lead, abhängig von Lead-Qualität, Branche,
            Frische, Unternehmensgröße, geografischer Ausrichtung, Kaufabsicht und Exklusivität.
          </p>
        </div>

        <article className="ink-panel p-8 sm:p-10">
          <div className="flex items-center justify-between">
            <p className="meta text-card/40">Dossier</p>
            <span className="meta text-brass">Exklusiv</span>
          </div>

          <p className="display mt-8 text-3xl text-card">{example.category}</p>

          <div className="mt-10 grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
            <div>
              <p className="meta text-card/40">Lead-Alter</p>
              <p className="mt-2 text-card">{example.age}</p>
            </div>
            <div>
              <p className="meta text-card/40">Lead Score</p>
              <p className="price mt-2 text-2xl text-brass">{example.score}/100</p>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-8">
            <p className="meta text-card/40">Preis</p>
            <p className="price mt-3 text-4xl text-card">{formatPrice(example.price)}</p>
          </div>

          <div className="mt-10">
            <CheckoutButton
              kind="exclusive"
              variant="on-ink"
              className="w-full"
              noteClassName="text-card/45"
            >
              Exklusiven Lead sichern
            </CheckoutButton>
          </div>
        </article>
      </div>
    </section>
  );
}
