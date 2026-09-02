import { NextRequest, NextResponse } from "next/server";
import type { PricingConfig } from "@/lib/pricing-types";
import { getPricingConfig, updatePricingConfig } from "@/lib/pricing-store";

function isAuthorized(request: NextRequest): boolean {
  const token = request.headers.get("x-admin-token");
  const expected = process.env.ADMIN_TOKEN ?? "leiter-admin-dev";
  return token === expected;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const config = await getPricingConfig();
  return NextResponse.json(config);
}

export async function PUT(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as PricingConfig;
    const updated = await updatePricingConfig(body);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Invalid pricing data" }, { status: 400 });
  }
}
