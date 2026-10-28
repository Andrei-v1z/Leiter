import { NextRequest } from "next/server";
import { completePlanChangeToken, takePlanChangeToken } from "@/lib/plan-change-tokens";
import { applyScheduledPlanChange } from "@/lib/subscription-switch";
import { getStripe } from "@/lib/stripe";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function page(title: string, message: string, status = 200): Response {
  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message);
  const html = `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle} · Leiter</title>
  <style>
    body { margin: 0; background: #f4f1eb; color: #171410; font-family: "IBM Plex Sans", sans-serif; }
    main { max-width: 36rem; margin: 0 auto; padding: 4.5rem 1.5rem; }
    p.eyebrow { color: #9a7544; font-family: "IBM Plex Mono", monospace; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; }
    h1 { font-size: 2.4rem; font-weight: 500; letter-spacing: -0.04em; line-height: 1.1; }
    p { line-height: 1.7; color: #6f6a62; }
    a { color: #171410; }
  </style>
</head>
<body>
  <main>
    <p class="eyebrow">Abo</p>
    <h1>${safeTitle}</h1>
    <p>${safeMessage}</p>
    <p><a href="/preise">Zurück zu den Preisen</a></p>
  </main>
</body>
</html>`;
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const row = await takePlanChangeToken(token);
  if (row === "missing") {
    return page("Link ungültig", "Dieser Bestätigungslink ist ungültig.", 404);
  }
  if (row === "expired") {
    return page("Link abgelaufen", "Dieser Bestätigungslink ist abgelaufen. Bitte starten Sie den Wechsel erneut.", 410);
  }
  if (row.usedAt && row.resultMessage) {
    return page("Wechsel vorgemerkt", row.resultMessage);
  }

  try {
    const stripe = getStripe();
    const message = await applyScheduledPlanChange(
      stripe,
      row.subscriptionId,
      row.newPriceId,
      row.extraSubscriptionIds
    );
    await completePlanChangeToken(token, message);
    return page("Wechsel vorgemerkt", message);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Der Wechsel konnte nicht gespeichert werden.";
    return page("Wechsel nicht möglich", message, 500);
  }
}
