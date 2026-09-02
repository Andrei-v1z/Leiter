export function formatPrice(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getVolumeTierForQuantity<
  T extends { quantity: number }
>(tiers: T[], quantity: number): T {
  const sorted = [...tiers].sort((a, b) => a.quantity - b.quantity);
  let selected = sorted[0];
  for (const tier of sorted) {
    if (quantity >= tier.quantity) {
      selected = tier;
    }
  }
  return selected;
}
