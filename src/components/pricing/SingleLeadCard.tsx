"use client";

import { CheckoutButton } from "@/components/checkout/CheckoutButton";
import { formatPrice } from "@/lib/pricing-utils";
import type { PricingConfig } from "@/lib/pricing-types";

interface SingleLeadCardProps {
  config: PricingConfig;
}

const features = [
  "Frische B2B-Anfrage",
  "Vollständige Anfragebeschreibung",
  "Kontaktinformationen",
  "Standort",
  "Branche",
  "Unternehmensgröße (sofern verfügbar)",
  "Lead-Alter",
  "Lead-Qualitätsindikatoren",
  "Kaufhistorie / Status",
  "Sicherer Dashboard-Zugang",
];

export function SingleLeadCard({ config }: SingleLeadCardProps) {
  const price = config.singleLead.basePrice;

  return (
    <div className="grid border border-line lg:grid-cols-[0.9fr_1.1fr]">
      <div className="ink-panel flex flex-col justify-between p-8 sm:p-10">
        <div>
          <p className="meta text-brass">Einzel-Lead</p>
          <div className="mt-8 flex items-baseline gap-3">
            <span className="meta text-card/45">ab</span>
            <span className="price text-6xl text-card">{formatPrice(price)}</span>
          </div>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-card/60">
            Ideal für Berater, die Leiter ohne großes Paket testen möchten.
          </p>
        </div>
        <div className="mt-10">
          <CheckoutButton kind="single" variant="on-ink" noteClassName="text-card/45">
            Lead kaufen
          </CheckoutButton>
        </div>
      </div>

      <div className="bg-card p-8 sm:p-10">
        <p className="meta text-muted">Enthalten</p>
        <ul className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm text-muted">
              <span className="mt-1.5 block h-1.5 w-1.5 shrink-0 bg-brass" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
