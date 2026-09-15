import { NextResponse } from "next/server";
import { CHECKOUT_UNAVAILABLE_MESSAGE } from "@/lib/checkout-availability";

export async function POST() {
  return NextResponse.json({ error: CHECKOUT_UNAVAILABLE_MESSAGE }, { status: 503 });
}
