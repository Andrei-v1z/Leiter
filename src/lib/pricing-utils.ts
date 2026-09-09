import type { VolumeTier } from "./pricing-types";

export const BASE_LEAD_PRICE = 80;

const VOLUME_STEPS = [
  { quantity: 1, discountPerLead: 0, badge: null, discountLabel: "Kein Rabatt" },
  { quantity: 5, discountPerLead: 5, badge: "Rabatt", discountLabel: null },
  { quantity: 10, discountPerLead: 10, badge: "Beliebt", discountLabel: null },
  { quantity: 25, discountPerLead: 15, badge: "Mengenrabatt", discountLabel: null },
  { quantity: 50, discountPerLead: 20, badge: "Starker Rabatt", discountLabel: null },
  { quantity: 100, discountPerLead: 25, badge: "Bester Rabatt", discountLabel: null },
] as const;

export function formatPrice(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function buildVolumeTiers(basePrice = BASE_LEAD_PRICE): VolumeTier[] {
  return VOLUME_STEPS.map((step) => {
    const perLeadPrice = Math.max(basePrice - step.discountPerLead, 1);
    const totalPrice = perLeadPrice * step.quantity;
    return {
      quantity: step.quantity,
      totalPrice,
      perLeadPrice,
      savings: basePrice * step.quantity - totalPrice,
      badge: step.badge,
      discountLabel: step.discountLabel,
    };
  });
}

export function getVolumeTierForQuantity<T extends { quantity: number }>(
  tiers: T[],
  quantity: number
): T {
  const sorted = [...tiers].sort((a, b) => a.quantity - b.quantity);
  let selected = sorted[0];
  for (const tier of sorted) {
    if (quantity >= tier.quantity) {
      selected = tier;
    }
  }
  return selected;
}
