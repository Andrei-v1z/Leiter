import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  resolveCheckoutLine,
  type CheckoutKind,
  type CheckoutRequest,
} from "@/lib/checkout-pricing";
import { getPricingConfig } from "@/lib/pricing-store";
import { getSiteUrl, getStripe } from "@/lib/stripe";

interface CheckoutBody extends CheckoutRequest {
  kind: CheckoutKind;
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
  const priceData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData = {
    currency: "eur",
    product_data: {
      name: line.name,
      description: line.description,
    },
    unit_amount: unitCents,
  };

  if (line.mode === "subscription") {
    priceData.recurring = { interval: "month" };
  }

  try {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: line.mode,
      locale: "de",
      billing_address_collection: "required",
      line_items: [{ price_data: priceData, quantity: line.quantity }],
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
      custom_text: {
        submit: {
          message:
            "Mit der Zahlung akzeptieren Sie die AGB. Rückerstattungen sind ausgeschlossen, weil digitale Lead-Daten verkauft werden.",
        },
      },
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
