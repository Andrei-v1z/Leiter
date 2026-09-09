import type { PricingConfig } from "./pricing-types";
import { getVolumeTierForQuantity } from "./pricing-utils";

export type CheckoutKind = "single" | "volume" | "exclusive" | "category" | "subscription";

export interface CheckoutRequest {
  kind: CheckoutKind;
  slug?: string;
  quantity?: number;
}

export interface CheckoutLine {
  name: string;
  description: string;
  mode: "payment" | "subscription";
  unitAmount: number;
  quantity: number;
}

export const NO_REFUND =
  "Digitale Lead-Daten. Keine Rückerstattung. Mit der Zahlung gelten die AGB von Leiter.";

export function resolveCheckoutLine(
  config: PricingConfig,
  body: CheckoutRequest
): { ok: true; line: CheckoutLine } | { ok: false; error: string; status: number } {
  switch (body.kind) {
    case "single":
      return {
        ok: true,
        line: {
          name: "Leiter Lead",
          description: NO_REFUND,
          mode: "payment",
          unitAmount: config.singleLead.basePrice,
          quantity: 1,
        },
      };
    case "volume": {
      const quantity = Number(body.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        return { ok: false, error: "Menge ungültig", status: 400 };
      }
      const exact = config.volumeTiers.find((tier) => tier.quantity === quantity);
      const tier = exact ?? getVolumeTierForQuantity(config.volumeTiers, quantity);
      if (!tier) {
        return { ok: false, error: "Paket nicht gefunden", status: 400 };
      }
      const qty = exact ? exact.quantity : quantity;
      return {
        ok: true,
        line: {
          name: qty === 1 ? "Leiter Lead" : `Leiter Lead-Paket (${qty} Leads)`,
          description: `${qty} ${qty === 1 ? "Lead" : "Leads"}. ${NO_REFUND}`,
          mode: "payment",
          unitAmount: tier.perLeadPrice,
          quantity: qty,
        },
      };
    }
    case "exclusive":
      return {
        ok: false,
        error: "Exklusive Leads werden nicht angeboten.",
        status: 400,
      };
    case "category": {
      const category = config.categories.find((item) => item.slug === body.slug);
      if (!category) {
        return { ok: false, error: "Kategorie nicht gefunden", status: 400 };
      }
      return {
        ok: true,
        line: {
          name: `Leiter Lead · ${category.name}`,
          description: NO_REFUND,
          mode: "payment",
          unitAmount: category.basePrice,
          quantity: 1,
        },
      };
    }
    case "subscription": {
      const plan = config.subscriptions.find((item) => item.slug === body.slug);
      if (!plan) {
        return { ok: false, error: "Abo nicht gefunden", status: 400 };
      }
      return {
        ok: true,
        line: {
          name: `Leiter ${plan.name}`,
          description: `${plan.includedLeads} Leads pro Monat. ${NO_REFUND}`,
          mode: "subscription",
          unitAmount: plan.monthlyPrice,
          quantity: 1,
        },
      };
    }
    default:
      return { ok: false, error: "Unbekannte Bestellung", status: 400 };
  }
}
