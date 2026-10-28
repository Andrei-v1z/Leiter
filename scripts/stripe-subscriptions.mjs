import { readFileSync, writeFileSync } from "node:fs";

const env = Object.fromEntries(
  readFileSync(new URL("../.env", import.meta.url), "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      const value = line.slice(index + 1).trim().replace(/^["']|["']$/g, "");
      return [line.slice(0, index), value];
    })
);

const key = env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY missing");
  process.exit(1);
}

const plans = [
  {
    slug: "zugang",
    name: "Leiter Zugang",
    amount: 24000,
    leads: 3,
    description: "3 exklusive B2B-Leads pro Monat. Monatlich kündbar. Keine Rückerstattung.",
  },
  {
    slug: "atelier",
    name: "Leiter Atelier",
    amount: 70000,
    leads: 10,
    description: "10 exklusive B2B-Leads pro Monat. Monatlich kündbar. Keine Rückerstattung.",
  },
  {
    slug: "kanzlei",
    name: "Leiter Kanzlei",
    amount: 195000,
    leads: 30,
    description: "30 exklusive B2B-Leads pro Monat. Monatlich kündbar. Keine Rückerstattung.",
  },
];

async function stripe(path, body) {
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${key}`,
      ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: body ? new URLSearchParams(body).toString() : undefined,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || `Stripe ${response.status}`);
  }
  return data;
}

const existing = await stripe("products?limit=100&active=true");
const bySlug = new Map();
for (const product of existing.data || []) {
  const slug = product.metadata?.slug;
  if (slug) bySlug.set(slug, product);
}

const created = [];

for (const plan of plans) {
  let product = bySlug.get(plan.slug);
  if (!product) {
    product = await stripe("products", {
      name: plan.name,
      description: plan.description,
      tax_code: "txcd_10000000",
      "metadata[slug]": plan.slug,
      "metadata[included_leads]": String(plan.leads),
    });
  } else if (!product.tax_code) {
    product = await stripe(`products/${product.id}`, { tax_code: "txcd_10000000" });
  }

  const prices = await stripe(`prices?product=${product.id}&active=true&limit=20`);
  let price = (prices.data || []).find(
    (item) =>
      item.lookup_key === `leiter_${plan.slug}_monthly` ||
      (item.recurring?.interval === "month" && item.unit_amount === plan.amount && item.currency === "eur")
  );

  if (!price) {
    price = await stripe("prices", {
      product: product.id,
      currency: "eur",
      unit_amount: String(plan.amount),
      "recurring[interval]": "month",
      lookup_key: `leiter_${plan.slug}_monthly`,
      tax_behavior: "exclusive",
      "metadata[slug]": plan.slug,
    });
  } else if (price.tax_behavior === "unspecified") {
    price = await stripe(`prices/${price.id}`, { tax_behavior: "exclusive" });
  }

  created.push({
    slug: plan.slug,
    productId: product.id,
    priceId: price.id,
    amount: price.unit_amount,
    interval: price.recurring?.interval || "",
  });
}

const out = `export const stripeSubscriptionPrices = ${JSON.stringify(
  Object.fromEntries(created.map((item) => [item.slug, item.priceId])),
  null,
  2
)} as const;\n`;

writeFileSync(new URL("../src/lib/stripe-subscription-prices.ts", import.meta.url), out);
console.log(JSON.stringify(created, null, 2));
