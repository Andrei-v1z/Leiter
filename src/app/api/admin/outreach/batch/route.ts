import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { cleanOutreachName, outreachRecipient } from "@/lib/lead-outreach-email";

const LIVE_SEND = "https://leiter.fr/api/admin/outreach";
const MAX_ROWS = 100;

function denied() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function isLocalHost(request: NextRequest): boolean {
  const host = request.nextUrl.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

type Incoming = { email?: unknown; name?: unknown };
type Result = { email: string; name: string; ok: boolean; error: string };

export async function POST(request: NextRequest) {
  if (!isLocalHost(request)) {
    return NextResponse.json({ error: "Die Liste gibt es nur lokal." }, { status: 404 });
  }
  if (!isAdminRequest(request)) return denied();

  const body = (await request.json().catch(() => null)) as { recipients?: Incoming[] } | null;
  const incoming = Array.isArray(body?.recipients) ? body.recipients : [];
  if (incoming.length === 0) {
    return NextResponse.json({ error: "Die Liste ist leer." }, { status: 400 });
  }
  if (incoming.length > MAX_ROWS) {
    return NextResponse.json({ error: `Höchstens ${MAX_ROWS} Adressen auf einmal.` }, { status: 400 });
  }

  const user = request.headers.get("x-admin-user") ?? "";
  const password = request.headers.get("x-admin-password") ?? "";
  const results: Result[] = [];
  let stopped = "";

  for (const row of incoming) {
    const email = outreachRecipient(row?.email);
    const rawName = typeof row?.name === "string" ? row.name : "";
    const cleaned = cleanOutreachName(rawName);
    const name = cleaned === null ? "" : cleaned;
    if (!email) {
      results.push({ email: "", name: rawName, ok: false, error: "Keine gültige E-Mail" });
      continue;
    }
    if (stopped) {
      results.push({ email, name, ok: false, error: stopped });
      continue;
    }

    let response: Response;
    try {
      response = await fetch(LIVE_SEND, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-user": user,
          "x-admin-password": password,
        },
        body: JSON.stringify({ email, name }),
      });
    } catch {
      results.push({ email, name, ok: false, error: "leiter.fr ist nicht erreichbar." });
      continue;
    }

    const data = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      const error = data?.error || "Die Mail konnte nicht gesendet werden.";
      results.push({ email, name, ok: false, error });
      if (response.status === 429 && error.includes("20")) stopped = error;
      continue;
    }
    results.push({ email, name, ok: true, error: "" });
  }

  const sent = results.filter((row) => row.ok).length;
  return NextResponse.json({ sent, results });
}
