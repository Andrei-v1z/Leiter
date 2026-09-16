import { NextRequest, NextResponse } from "next/server";
import type { PricingConfig } from "@/lib/pricing-types";
import { isAdminRequest } from "@/lib/admin-auth";
import { getPricingConfig, updatePricingConfig } from "@/lib/pricing-store";

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const config = await getPricingConfig();
  return NextResponse.json(config);
}

export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) {
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
