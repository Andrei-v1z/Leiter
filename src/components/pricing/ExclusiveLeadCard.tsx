"use client";

import { CheckoutButton } from "@/components/checkout/CheckoutButton";
import { formatPrice } from "@/lib/pricing-utils";
import type { PricingConfig } from "@/lib/pricing-types";

interface ExclusiveLeadCardProps {
  config: PricingConfig;
}

export function ExclusiveLeadCard({ config }: ExclusiveLeadCardProps) {
  const { exclusive } = config;

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
            Ab {formatPrice(exclusive.basePrice)} pro Lead. Du siehst den Lead nicht vorher. Die
            Zuteilung ist zufällig, die Qualität marktführend, und der Lead gehört nur dir.
          </p>
        </div>

        <article className="ink-panel p-8 sm:p-10">
          <div className="flex items-center justify-between">
            <p className="meta text-card/40">Exklusiv</p>
            <span className="meta text-brass">Nur für dich</span>
          </div>

          <p className="display mt-8 text-3xl text-card">Zufällige Zuteilung. Spitze am Markt.</p>

          <p className="mt-6 max-w-sm text-sm leading-relaxed text-card/60">
            Branche, Standort und Bedarf kommen mit dem Kauf, nicht als Vorschau.
          </p>

          <div className="mt-8 border-t border-white/10 pt-8">
            <p className="meta text-card/40">Preis</p>
            <p className="price mt-3 text-4xl text-card">{formatPrice(exclusive.basePrice)}</p>
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
