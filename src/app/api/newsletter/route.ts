import { NextRequest, NextResponse } from "next/server";
import { isValidEmail, normalizeEmail, normalizePlan } from "@/lib/newsletter";
import { subscribeToNewsletter } from "@/lib/newsletter-store";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: unknown; plan?: unknown };
    const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
    const plan = normalizePlan(body.plan);

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Bitte geben Sie eine gültige E-Mail-Adresse ein." }, { status: 400 });
    }

    await subscribeToNewsletter(email, plan);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
  }
}
