import { randomBytes } from "crypto";
import type Stripe from "stripe";
import { isValidEmail, normalizeEmail } from "@/lib/newsletter";
import { stripeSubscriptionPrices } from "@/lib/stripe-subscription-prices";
import { createPlanChangeToken } from "@/lib/plan-change-tokens";
import { getSiteUrl } from "@/lib/stripe";

const PLAN_NAMES: Record<keyof typeof stripeSubscriptionPrices, string> = {
  zugang: "Zugang",
  atelier: "Atelier",
  kanzlei: "Kanzlei",
};

const ACTIVE_STATUSES = new Set(["active", "trialing", "past_due", "unpaid", "paused"]);

export type SubscriptionDecision =
  | { action: "checkout"; customerId?: string; customerEmail?: string }
  | { action: "confirm"; message: string }
  | { action: "error"; status: number; message: string };

type LooseSubscription = Stripe.Subscription & { current_period_end?: number };

function planName(priceId: string): string {
  const entry = Object.entries(stripeSubscriptionPrices).find(([, id]) => id === priceId);
  if (!entry) return "Abo";
  return PLAN_NAMES[entry[0] as keyof typeof PLAN_NAMES];
}

function priceId(subscription: Stripe.Subscription): string {
  const price = subscription.items.data[0]?.price;
  if (!price) return "";
  return typeof price === "string" ? price : price.id;
}

function periodEnd(subscription: Stripe.Subscription): number {
  const loose = subscription as LooseSubscription;
  if (typeof loose.current_period_end === "number") return loose.current_period_end;
  const item = subscription.items.data[0] as { current_period_end?: number } | undefined;
  return item?.current_period_end ?? 0;
}

function formatDate(unix: number): string {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "long",
    timeZone: "Europe/Berlin",
  }).format(new Date(unix * 1000));
}

async function customersForEmail(stripe: Stripe, email: string): Promise<Stripe.Customer[]> {
  const safe = email.replace(/["\\]/g, "");
  try {
    const searched = await stripe.customers.search({
      query: `email:"${safe}"`,
      limit: 100,
    });
    return searched.data;
  } catch {
    const listed = await stripe.customers.list({ email, limit: 100 });
    return listed.data;
  }
}

async function activeSubscriptions(stripe: Stripe, email: string): Promise<Stripe.Subscription[]> {
  const customers = await customersForEmail(stripe, email);
  const found: Stripe.Subscription[] = [];
  for (const customer of customers) {
    const page = await stripe.subscriptions.list({
      customer: customer.id,
      status: "all",
      limit: 100,
    });
    for (const subscription of page.data) {
      if (ACTIVE_STATUSES.has(subscription.status)) found.push(subscription);
    }
  }
  found.sort((a, b) => b.created - a.created);
  return found;
}

async function scheduledPriceId(stripe: Stripe, subscription: Stripe.Subscription): Promise<string | null> {
  const scheduleId =
    typeof subscription.schedule === "string" ? subscription.schedule : subscription.schedule?.id;
  if (!scheduleId) return null;
  const schedule = await stripe.subscriptionSchedules.retrieve(scheduleId);
  const phases = schedule.phases ?? [];
  if (phases.length < 2) return null;
  const next = phases[phases.length - 1];
  const price = next?.items[0]?.price;
  const id = typeof price === "string" ? price : price?.id;
  const current = priceId(subscription);
  if (!id || id === current) return null;
  return id;
}

function confirmMessage(email: string): string {
  return `Wir haben einen Bestätigungslink an ${email} geschickt. Der Wechsel gilt ab dem nächsten Abrechnungsmonat, nachdem Sie den Link geöffnet haben. Bis dahin bleibt Ihr aktuelles Abo aktiv.`;
}

async function sendConfirmation(to: string, currentName: string, nextName: string, link: string): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    console.info(`Abo-Wechsel für ${to}: ${currentName} → ${nextName}\n${link}`);
    return;
  }
  throw new Error("Bestätigung konnte nicht gesendet werden.");
}

export async function prepareSubscriptionCheckout(
  stripe: Stripe,
  rawEmail: string,
  slug: string
): Promise<SubscriptionDecision> {
  const email = normalizeEmail(rawEmail);
  if (!isValidEmail(email)) {
    return { action: "error", status: 400, message: "Bitte geben Sie eine gültige E-Mail-Adresse ein." };
  }

  const nextPriceId = stripeSubscriptionPrices[slug as keyof typeof stripeSubscriptionPrices];
  if (!nextPriceId) {
    return { action: "error", status: 400, message: "Abo nicht gefunden" };
  }

  const subscriptions = await activeSubscriptions(stripe, email);
  if (subscriptions.length === 0) {
    const customers = await customersForEmail(stripe, email);
    return {
      action: "checkout",
      customerId: customers[0]?.id,
      customerEmail: customers[0] ? undefined : email,
    };
  }

  const primary = subscriptions[0];
  const currentPrice = priceId(primary);
  const pending = await scheduledPriceId(stripe, primary);

  if (pending === nextPriceId) {
    return {
      action: "error",
      status: 409,
      message: `Der Wechsel auf ${planName(nextPriceId)} ist bereits vorgemerkt und gilt ab dem nächsten Abrechnungszeitraum.`,
    };
  }

  if (currentPrice === nextPriceId && !pending) {
    return {
      action: "error",
      status: 409,
      message: `Sie haben das Abo ${planName(nextPriceId)} bereits. Ein zweites Abo ist nicht möglich.`,
    };
  }

  const token = randomBytes(32).toString("hex");
  await createPlanChangeToken({
    token,
    email,
    subscriptionId: primary.id,
    newPriceId: nextPriceId,
    extraSubscriptionIds: subscriptions.slice(1).map((subscription) => subscription.id),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });

  const link = `${getSiteUrl()}/api/checkout/confirm?token=${token}`;
  try {
    await sendConfirmation(email, planName(currentPrice), planName(nextPriceId), link);
  } catch {
    return {
      action: "error",
      status: 503,
      message: "Die Bestätigung konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
    };
  }

  return { action: "confirm", message: confirmMessage(email) };
}

export async function applyScheduledPlanChange(
  stripe: Stripe,
  subscriptionId: string,
  newPriceId: string,
  extraSubscriptionIds: string[]
): Promise<string> {
  let subscription = await stripe.subscriptions.retrieve(subscriptionId);
  if (!ACTIVE_STATUSES.has(subscription.status)) {
    throw new Error("Dieses Abo ist nicht mehr aktiv.");
  }

  if (subscription.cancel_at_period_end) {
    subscription = await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: false });
  }

  const currentPrice = priceId(subscription);
  const end = periodEnd(subscription);
  if (!currentPrice || !end) {
    throw new Error("Der Abrechnungszeitraum konnte nicht gelesen werden.");
  }

  const existingScheduleId =
    typeof subscription.schedule === "string" ? subscription.schedule : subscription.schedule?.id;
  const schedule = existingScheduleId
    ? await stripe.subscriptionSchedules.retrieve(existingScheduleId)
    : await stripe.subscriptionSchedules.create({ from_subscription: subscriptionId });

  const now = Math.floor(Date.now() / 1000);
  const currentPhase =
    schedule.phases.find(
      (phase) => phase.start_date <= now && (phase.end_date == null || phase.end_date > now)
    ) ?? schedule.phases[0];
  if (!currentPhase) {
    throw new Error("Der aktuelle Abo-Zeitraum konnte nicht gelesen werden.");
  }

  await stripe.subscriptionSchedules.update(schedule.id, {
    end_behavior: "release",
    proration_behavior: "none",
    phases: [
      {
        items: [{ price: currentPrice, quantity: 1 }],
        start_date: currentPhase.start_date,
        end_date: end,
        proration_behavior: "none",
      },
      {
        items: [{ price: newPriceId, quantity: 1 }],
        proration_behavior: "none",
      },
    ],
  });

  for (const extraId of extraSubscriptionIds) {
    if (extraId === subscriptionId) continue;
    await stripe.subscriptions.update(extraId, { cancel_at_period_end: true });
  }

  const extraNote =
    extraSubscriptionIds.length > 0 ? " Weitere laufende Abos enden zum selben Termin." : "";
  return `Ihr Abo wechselt am ${formatDate(end)} zu ${planName(newPriceId)}. Bis dahin bleibt ${planName(currentPrice)} aktiv. Es wird jetzt nichts zusätzlich berechnet.${extraNote}`;
}
