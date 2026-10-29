import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { isAdminRequest } from "@/lib/admin-auth";
import { getStripe } from "@/lib/stripe";

const PLAN_NAMES: Record<string, string> = {
  price_1UVSh5AZohsks7xNq0fsIWPB: "Zugang",
  price_1UVSh6AZohsks7xN9NlwFxGq: "Atelier",
  price_1UVSh7AZohsks7xNNWEPlMdO: "Kanzlei",
};

const RUNNING = new Set(["active", "trialing", "past_due", "unpaid", "paused"]);

function planName(priceId: string): string {
  return PLAN_NAMES[priceId] ?? "Abo";
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stripe = getStripe();
    const subs = await stripe.subscriptions.list({
      status: "all",
      limit: 100,
      expand: ["data.customer"],
    });
    const sessions = await stripe.checkout.sessions.list({
      limit: 100,
      status: "complete",
    });

    const subscriptions = subs.data
      .filter((row) => RUNNING.has(row.status))
      .map((row) => {
        const customer = row.customer;
        const person = customer && typeof customer === "object" && !("deleted" in customer && customer.deleted)
          ? (customer as Stripe.Customer)
          : null;
        const priceId = row.items.data[0]?.price?.id ?? "";
        const renews = row.items.data[0]?.current_period_end;
        return {
          email: person?.email ?? "",
          name: person?.name ?? "",
          plan: planName(priceId),
          status: row.status,
          since: row.start_date ? new Date(row.start_date * 1000).toISOString() : "",
          renews: renews ? new Date(renews * 1000).toISOString() : null,
        };
      });

    const purchases = sessions.data
      .map((row) => ({
        email: row.customer_details?.email ?? row.customer_email ?? "",
        product: row.metadata?.product || "Leiter",
        amount: row.amount_total ?? 0,
        currency: row.currency ?? "eur",
        createdAt: new Date(row.created * 1000).toISOString(),
        mode: row.mode === "subscription" ? "subscription" : "payment",
      }))
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

    return NextResponse.json({ subscriptions, purchases });
  } catch {
    return NextResponse.json({ error: "Kunden konnten nicht geladen werden." }, { status: 502 });
  }
}
