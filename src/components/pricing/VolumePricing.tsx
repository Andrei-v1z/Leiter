"use client";

import { useState } from "react";
import { CheckoutButton } from "@/components/checkout/CheckoutButton";
import { Button } from "@/components/ui/Button";
import { FadeBlur } from "@/components/ui/FadeBlur";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/pricing-utils";
import type { PricingConfig } from "@/lib/pricing-types";

interface VolumePricingProps {
  config: PricingConfig;
}

export function VolumePricing({ config }: VolumePricingProps) {
  const tiers = config.volumeTiers;
  const quantities = tiers.map((t) => t.quantity);
  const [selectedIndex, setSelectedIndex] = useState(
    tiers.findIndex((t) => t.quantity === 10) >= 0
      ? tiers.findIndex((t) => t.quantity === 10)
      : 1
  );

  const selected = tiers[selectedIndex];
  const basePrice = tiers[0]?.perLeadPrice ?? config.singleLead.basePrice;

  return (
    <section className="section-padding">
      <div className="page-wrap">
        <FadeBlur className="max-w-2xl">
          <p className="eyebrow">Mengenrabatte</p>
          <blockquote className="display mt-5 text-4xl text-ink sm:text-5xl">
            Je mehr du kaufst, desto weniger zahlst du pro Lead.
          </blockquote>
          <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-muted">
            Leads ab {formatPrice(config.singleLead.basePrice)}. Ab 5 Leads gibt es Rabatt —
            je mehr du kaufst, desto günstiger wird der Stückpreis. Keine Rückerstattung.
          </p>
          <div className="mt-8">
            <Button href="/preise#pakete" variant="outline">
              Lead-Paket zusammenstellen
            </Button>
          </div>
        </FadeBlur>

        <FadeBlur delay={80} className="mt-16 hidden border-y border-line py-10 lg:block">
          <div className="flex items-end justify-between gap-2">
            {tiers.map((tier, i) => (
              <div key={tier.quantity} className="flex flex-1 flex-col items-center">
                <p
                  className={cn(
                    "price text-3xl",
                    i === selectedIndex ? "text-navy" : "text-ink"
                  )}
                >
                  {formatPrice(tier.perLeadPrice)}
                </p>
                <p className="meta mt-2 text-muted">
                  {tier.quantity === 1 ? "Einzel" : `${tier.quantity} Leads`}
                </p>
                {i < tiers.length - 1 && (
                  <span className="sr-only">dann</span>
                )}
              </div>
            ))}
          </div>
        </FadeBlur>

        <FadeBlur delay={140} className="mt-12 border border-line bg-card p-8 sm:p-10">
          <label className="meta text-muted">
            Lead-Menge wählen
          </label>
          <input
            type="range"
            min={0}
            max={tiers.length - 1}
            step={1}
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(Number(e.target.value))}
            className="mt-6 w-full accent-brass"
          />
          <div className="mt-3 flex justify-between font-mono text-xs text-muted">
            {quantities.map((q) => (
              <span key={q}>{q === 100 ? "100+" : q}</span>
            ))}
          </div>

          <div className="mt-10 grid gap-10 border-t border-line pt-10 md:grid-cols-2">
            <div>
              <p className="meta text-muted">Gesamtpreis</p>
              <p className="price mt-3 text-5xl text-ink">{formatPrice(selected.totalPrice)}</p>
              {selected.savings > 0 && (
                <p className="mt-3 text-sm text-brass">
                  Du sparst {formatPrice(selected.savings)}
                </p>
              )}
            </div>
            <div>
              <p className="meta text-muted">Preis pro Lead</p>
              <div className="mt-3 flex items-baseline gap-4">
                {selected.perLeadPrice < basePrice && (
                  <span className="price text-lg text-muted line-through">
                    {formatPrice(basePrice)}
                  </span>
                )}
                <span className="price text-5xl text-navy">
                  {formatPrice(selected.perLeadPrice)}
                </span>
              </div>
              {selected.badge && (
                <p className="meta mt-4 text-ink">
                  {selected.badge}
                </p>
              )}
            </div>
          </div>

          <div className="mt-10">
            <CheckoutButton kind="volume" quantity={selected.quantity}>
              Paket auswählen
            </CheckoutButton>
          </div>
        </FadeBlur>

        <FadeBlur delay={180} id="pakete" className="mt-6 grid border-x border-t border-line sm:grid-cols-2 lg:grid-cols-3">
          {tiers.map((tier, i) => (
            <button
              key={tier.quantity}
              type="button"
              onClick={() => setSelectedIndex(i)}
              className={cn(
                "relative border-b border-r border-line p-7 text-left transition-colors",
                selectedIndex === i ? "bg-navy text-card" : "bg-card hover:bg-paper"
              )}
            >
              {tier.badge && (
                <span
                  className={cn(
                    "meta",
                    selectedIndex === i ? "text-brass" : "text-muted"
                  )}
                >
                  {tier.badge}
                </span>
              )}
              <p
                className={cn(
                  "mt-3 text-sm",
                  selectedIndex === i ? "text-card/50" : "text-muted"
                )}
              >
                {tier.quantity === 1 ? "1 Lead" : `${tier.quantity} Leads`}
              </p>
              <p className="price mt-2 text-3xl">
                {formatPrice(tier.totalPrice)}
              </p>
              <p
                className={cn(
                  "mt-1 text-sm",
                  selectedIndex === i ? "text-brass" : "text-muted"
                )}
              >
                {formatPrice(tier.perLeadPrice)} / Lead
              </p>
              {tier.savings > 0 ? (
                <p
                  className={cn(
                    "mt-4 text-xs",
                    selectedIndex === i ? "text-card/50" : "text-muted"
                  )}
                >
                  Du sparst {formatPrice(tier.savings)}
                </p>
              ) : (
                <p
                  className={cn(
                    "mt-4 text-xs",
                    selectedIndex === i ? "text-card/50" : "text-muted"
                  )}
                >
                  {tier.discountLabel}
                </p>
              )}
            </button>
          ))}
        </FadeBlur>
      </div>
    </section>
  );
}
