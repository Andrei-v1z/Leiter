import type { PricingConfig } from "./pricing-types";
import { BASE_LEAD_PRICE, buildVolumeTiers } from "./pricing-utils";

export const PRICING_SCHEMA_VERSION = 2;

export const defaultPricingConfig: PricingConfig = {
  singleLead: {
    basePrice: BASE_LEAD_PRICE,
    currency: "EUR",
  },
  volumeTiers: buildVolumeTiers(BASE_LEAD_PRICE),
  categories: [
    { slug: "unternehmensberatung", name: "Unternehmensberatung", basePrice: BASE_LEAD_PRICE },
    { slug: "foerdermittelberatung", name: "Fördermittelberatung", basePrice: BASE_LEAD_PRICE },
    { slug: "digitalisierung", name: "Digitalisierung", basePrice: BASE_LEAD_PRICE },
    { slug: "finanzierung", name: "Finanzierung", basePrice: BASE_LEAD_PRICE },
    { slug: "ma", name: "M&A", basePrice: BASE_LEAD_PRICE },
  ],
  exclusive: {
    basePrice: BASE_LEAD_PRICE,
    exampleLead: {
      category: "Fördermittelberatung",
      age: "1 Stunde",
      score: 96,
      price: BASE_LEAD_PRICE,
    },
  },
  subscriptions: [
    {
      slug: "zugang",
      name: "Zugang",
      monthlyPrice: 240,
      includedLeads: 3,
      badge: null,
      featured: false,
      description: "Drei Leads im Monat zum Einstiegspreis. Ab fünf Leads gilt der Mengenrabatt.",
      features: [
        "3 Leads pro Monat",
        "80 € pro Lead",
        "Kontakt und Anfrage enthalten",
        "Monatlich kündbar",
        "Keine Rückerstattung",
      ],
      cta: "Zugang wählen",
    },
    {
      slug: "atelier",
      name: "Atelier",
      monthlyPrice: 700,
      includedLeads: 10,
      badge: "Empfohlen",
      featured: true,
      description: "Zehn Leads im Monat mit Mengenrabatt: 70 € statt 80 € pro Lead.",
      features: [
        "10 Leads pro Monat",
        "70 € pro Lead · 10 € Rabatt",
        "Kontakt und Anfrage enthalten",
        "Monatlich kündbar",
        "Keine Rückerstattung",
      ],
      cta: "Atelier wählen",
    },
    {
      slug: "kanzlei",
      name: "Kanzlei",
      monthlyPrice: 1950,
      includedLeads: 30,
      badge: "Bester Rabatt",
      featured: false,
      description: "Dreißig Leads im Monat für Teams. 65 € statt 80 € pro Lead.",
      features: [
        "30 Leads pro Monat",
        "65 € pro Lead · 15 € Rabatt",
        "Kontakt und Anfrage enthalten",
        "Monatlich kündbar",
        "Keine Rückerstattung",
      ],
      cta: "Kanzlei wählen",
    },
  ],
  settings: {
    noSubscriptionRequired: false,
    schemaVersion: PRICING_SCHEMA_VERSION,
  },
};
