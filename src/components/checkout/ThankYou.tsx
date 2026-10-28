"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { FadeBlur } from "@/components/ui/FadeBlur";

type Receipt = {
  product: string;
  mode: "payment" | "subscription";
  amount: number;
  currency: string;
};

const SESSION_ID = /^cs_(live|test)_[A-Za-z0-9]+$/;

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

export function ThankYou() {
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("session_id") ?? "";
    if (!SESSION_ID.test(id)) return;
    let cancelled = false;
    fetch(`/api/checkout/session?session_id=${encodeURIComponent(id)}`)
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json()) as Receipt;
      })
      .then((data) => {
        if (!cancelled && data?.product) setReceipt(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const delivery =
    receipt?.mode === "subscription"
      ? "Ihr Abo ist aktiv. Die Leads dieses Zeitraums werden zugestellt."
      : "Die gekauften Lead-Daten werden Ihnen zugestellt.";

  return (
    <section className="section-padding">
      <div className="page-wrap grid items-end gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
        <FadeBlur immediate>
          <p className="eyebrow">Kauf</p>
          <h1 className="display mt-6 text-5xl text-ink sm:text-7xl">Vielen Dank.</h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            Die Zahlung ist eingegangen. Stripe schickt die Rechnung an Ihre E-Mail.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/">Zur Startseite</Button>
            <Button href="/preise" variant="outline">
              Weitere Leads
            </Button>
          </div>
        </FadeBlur>

        <FadeBlur immediate delay={80}>
          <div className="border border-line bg-card p-8 sm:p-10">
            <p className="meta text-muted">Ihre Bestellung</p>
            {receipt ? (
              <>
                <p className="display mt-5 text-3xl text-ink">{receipt.product}</p>
                <p className="price mt-4 text-4xl text-navy">{formatMoney(receipt.amount, receipt.currency)}</p>
              </>
            ) : (
              <p className="mt-5 text-lg leading-relaxed text-ink">Zahlung bestätigt.</p>
            )}
            <ol className="mt-8 space-y-5 border-t border-line pt-8">
              <li className="flex gap-4 text-sm leading-relaxed text-muted">
                <span className="meta text-brass">01</span>
                Zahlung bestätigt.
              </li>
              <li className="flex gap-4 text-sm leading-relaxed text-muted">
                <span className="meta text-brass">02</span>
                {delivery}
              </li>
              <li className="flex gap-4 text-sm leading-relaxed text-muted">
                <span className="meta text-brass">03</span>
                Die Rechnung liegt in Ihrer E-Mail.
              </li>
            </ol>
          </div>
        </FadeBlur>
      </div>
      <p className="page-wrap mt-12 max-w-xl text-xs leading-relaxed text-muted">
        Digitale Lead-Daten. Keine Rückerstattung. Mit der Zahlung gelten die AGB von Leiter.
      </p>
    </section>
  );
}
