import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

const SESSION_ID = /^cs_(live|test)_[A-Za-z0-9]+$/;

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("session_id") ?? "";
  if (!SESSION_ID.test(id)) {
    return NextResponse.json({ error: "Kauf nicht gefunden" }, { status: 404 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(id, { expand: ["line_items"] });
    if (session.status !== "complete") {
      return NextResponse.json({ error: "Kauf nicht gefunden" }, { status: 404 });
    }
    const product =
      session.metadata?.product ||
      session.line_items?.data[0]?.description ||
      "Leiter";
    return NextResponse.json({
      product,
      mode: session.mode === "subscription" ? "subscription" : "payment",
      amount: session.amount_total ?? 0,
      currency: session.currency ?? "eur",
    });
  } catch {
    return NextResponse.json({ error: "Kauf nicht gefunden" }, { status: 404 });
  }
}
