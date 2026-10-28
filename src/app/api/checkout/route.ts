import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  resolveCheckoutLine,
  type CheckoutKind,
  type CheckoutRequest,
} from "@/lib/checkout-pricing";
import { getPricingConfig } from "@/lib/pricing-store";
import { stripeSubscriptionPrices } from "@/lib/stripe-subscription-prices";
import { prepareSubscriptionCheckout } from "@/lib/subscription-switch";
import { getSiteUrl, getStripe } from "@/lib/stripe";

interface CheckoutBody extends CheckoutRequest {
  kind: CheckoutKind;
  email?: string;
}

export async function POST(request: NextRequest) {
  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }

  if (!body?.kind) {
    return NextResponse.json({ error: "Unbekannte Bestellung" }, { status: 400 });
  }

  const config = await getPricingConfig();
  const resolved = resolveCheckoutLine(config, body);
  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const { line } = resolved;
  const unitCents = Math.round(line.unitAmount * 100);
  if (unitCents <= 0 || line.quantity < 1) {
    return NextResponse.json({ error: "Ungültiger Preis" }, { status: 400 });
  }

  let stripe: ReturnType<typeof getStripe>;
  try {
    stripe = getStripe();
  } catch {
    return NextResponse.json(
      { error: "Stripe ist nicht konfiguriert. Bitte den Secret Key prüfen." },
      { status: 503 }
    );
  }

  const site = getSiteUrl();
  let customerId: string | undefined;
  let customerEmail: string | undefined;

  if (line.mode === "subscription") {
    const decision = await prepareSubscriptionCheckout(stripe, body.email ?? "", body.slug ?? "");
    if (decision.action === "error") {
      return NextResponse.json({ error: decision.message }, { status: decision.status });
    }
    if (decision.action === "confirm") {
      return NextResponse.json({ confirmEmail: true, message: decision.message });
    }
    customerId = decision.customerId;
    customerEmail = decision.customerEmail;
  }
  const priceData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData = {
    currency: "eur",
    product_data: {
      name: line.name,
      description: line.description,
      tax_code: "txcd_10000000",
    },
    unit_amount: unitCents,
    tax_behavior: "exclusive",
  };

  let lineItem: Stripe.Checkout.SessionCreateParams.LineItem = {
    price_data: priceData,
    quantity: line.quantity,
  };

  if (line.mode === "subscription") {
    const priceId = stripeSubscriptionPrices[body.slug as keyof typeof stripeSubscriptionPrices];
    if (!priceId) {
      return NextResponse.json({ error: "Abo nicht gefunden" }, { status: 400 });
    }
    lineItem = { price: priceId, quantity: 1 };
  }

  try {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: line.mode,
      locale: "de",
      billing_address_collection: "required",
      line_items: [lineItem],
      success_url: `${site}/kasse/erfolg?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/kasse/abgebrochen`,
      metadata: {
        kind: body.kind,
        slug: body.slug ?? "",
        quantity: String(line.quantity),
        unit_amount_eur: String(line.unitAmount),
        total_eur: String(line.unitAmount * line.quantity),
        product: line.name,
      },
      ...(customerId ? { customer: customerId } : {}),
      ...(customerEmail ? { customer_email: customerEmail } : {}),
    };

    if (line.mode === "payment") {
      sessionParams.customer_creation = "always";
      sessionParams.submit_type = "pay";
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (!session.url) {
      return NextResponse.json(
        { error: "Checkout konnte nicht gestartet werden" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Stripe-Fehler";
    const userMessage = /invalid api key/i.test(message)
      ? "Stripe-Schlüssel ungültig. Bitte den Secret Key in der Umgebung prüfen."
      : /not set/i.test(message)
        ? "Stripe ist nicht konfiguriert. Bitte den Secret Key prüfen."
        : message;
    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
