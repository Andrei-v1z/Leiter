import { NextResponse } from "next/server";
import { getPricingConfig } from "@/lib/pricing-store";

export async function GET() {
  const config = await getPricingConfig();
  return NextResponse.json(config);
}
