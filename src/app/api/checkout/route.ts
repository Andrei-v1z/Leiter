import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getPricingConfig } from "@/lib/pricing-store";
import { getSiteUrl, getStripe } from "@/lib/stripe";

type CheckoutKind = "single" | "volume" | "exclusive" | "category" | "subscription";

interface CheckoutBody {
  kind: CheckoutKind;
  slug?: string;
  quantity?: number;
}

const NO_REFUND =
  "Digitale Lead-Daten. Keine Rückerstattung. Mit der Zahlung gelten die AGB von Leiter.be.";

export async function POST(request: NextRequest) {
  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }

  const config = await getPricingConfig();
  const stripe = getStripe();
  const site = getSiteUrl();

  let name = "";
  let description = NO_REFUND;
  let amount = 0;
  let mode: "payment" | "subscription" = "payment";

  switch (body.kind) {
    case "single": {
      name = "Leiter Einzel-Lead";
      amount = config.singleLead.basePrice;
      break;
    }
    case "volume": {
      const quantity = Number(body.quantity);
      const tier = config.volumeTiers.find((t) => t.quantity === quantity);
      if (!tier) {
        return NextResponse.json({ error: "Paket nicht gefunden" }, { status: 400 });
      }
      name = `Leiter Lead-Paket (${tier.quantity} ${tier.quantity === 1 ? "Lead" : "Leads"})`;
      amount = tier.totalPrice;
      break;
    }
    case "exclusive": {
      name = `Leiter Exklusiv-Lead · ${config.exclusive.exampleLead.category}`;
      amount = config.exclusive.exampleLead.price;
      break;
    }
    case "category": {
      const category = config.categories.find((c) => c.slug === body.slug);
      if (!category) {
        return NextResponse.json({ error: "Kategorie nicht gefunden" }, { status: 400 });
      }
      name = `Leiter Lead · ${category.name}`;
      amount = category.basePrice;
      break;
    }
    case "subscription": {
      const plan = config.subscriptions.find((p) => p.slug === body.slug);
      if (!plan) {
        return NextResponse.json({ error: "Abo nicht gefunden" }, { status: 400 });
      }
      name = `Leiter ${plan.name}`;
      description = `${plan.includedLeads} Leads pro Monat. ${NO_REFUND}`;
      amount = plan.monthlyPrice;
      mode = "subscription";
      break;
    }
    default:
      return NextResponse.json({ error: "Unbekannte Bestellung" }, { status: 400 });
  }

  if (amount <= 0) {
    return NextResponse.json({ error: "Ungültiger Preis" }, { status: 400 });
  }

  const priceData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData = {
    currency: "eur",
    product_data: {
      name,
      description,
    },
    unit_amount: Math.round(amount * 100),
  };

  if (mode === "subscription") {
    priceData.recurring = { interval: "month" };
  }

  try {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode,
      locale: "de",
      billing_address_collection: "required",
      line_items: [{ price_data: priceData, quantity: 1 }],
      success_url: `${site}/kasse/erfolg?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/kasse/abgebrochen`,
      metadata: {
        kind: body.kind,
        slug: body.slug ?? "",
        quantity: String(body.quantity ?? ""),
        product: name,
      },
      custom_text: {
        submit: {
          message:
            "Mit der Zahlung akzeptieren Sie die AGB. Rückerstattungen sind ausgeschlossen, weil digitale Lead-Daten verkauft werden.",
        },
      },
    };

    if (mode === "payment") {
      sessionParams.customer_creation = "always";
      sessionParams.submit_type = "pay";
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.url) {
      return NextResponse.json({ error: "Checkout konnte nicht gestartet werden" }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stripe-Fehler";
    const userMessage = /invalid api key/i.test(message)
      ? "Stripe-Schlüssel ungültig. Bitte den Secret Key in der Umgebung prüfen."
      : message;
    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
