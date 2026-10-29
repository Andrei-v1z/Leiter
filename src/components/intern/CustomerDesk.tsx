"use client";

import { useEffect, useState } from "react";

type SubscriptionRow = {
  email: string;
  name: string;
  plan: string;
  status: string;
  since: string;
  renews: string | null;
};

type PurchaseRow = {
  email: string;
  product: string;
  amount: number;
  currency: string;
  createdAt: string;
  mode: "subscription" | "payment";
};

const STATUS_LABEL: Record<string, string> = {
  active: "Aktiv",
  trialing: "Probe",
  past_due: "Zahlung offen",
  unpaid: "Unbezahlt",
  paused: "Pausiert",
};

function authHeaders(user: string, password: string) {
  return {
    "x-admin-user": user,
    "x-admin-password": password,
  };
}

function formatWhen(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("de-DE", { dateStyle: "medium" }).format(date);
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: currency.toUpperCase() || "EUR",
  }).format(amount / 100);
}

export function CustomerDesk({ user, password }: { user: string; password: string }) {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [purchases, setPurchases] = useState<PurchaseRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/customers", { headers: authHeaders(user, password) })
      .then(async (response) => {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
          subscriptions?: SubscriptionRow[];
          purchases?: PurchaseRow[];
        } | null;
        if (!response.ok) {
          return { error: data?.error || "Kunden konnten nicht geladen werden.", subscriptions: [], purchases: [] };
        }
        return {
          error: "",
          subscriptions: data?.subscriptions ?? [],
          purchases: data?.purchases ?? [],
        };
      })
      .then((data) => {
        if (cancelled) return;
        setError(data.error);
        setSubscriptions(data.subscriptions);
        setPurchases(data.purchases);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Kunden konnten nicht geladen werden.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, password]);

  if (loading) {
    return <p className="mt-10 text-sm text-muted">Kunden werden geladen.</p>;
  }

  return (
    <div className="mt-10 space-y-8">
      {error && <p className="text-sm text-error">{error}</p>}
      <section className="border border-line bg-card p-6">
        <h2 className="text-lg font-semibold text-ink">Aktive Abos</h2>
        <p className="mt-2 text-sm text-muted">{subscriptions.length} laufende Mitgliedschaften.</p>
        {subscriptions.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Noch kein aktives Abo.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {subscriptions.map((row) => (
              <li key={`${row.email}-${row.plan}-${row.since}`} className="grid gap-2 py-4 sm:grid-cols-[1.4fr_0.8fr_0.7fr_0.8fr]">
                <div>
                  <p className="text-sm text-ink">{row.email || "Ohne E-Mail"}</p>
                  {row.name ? <p className="text-sm text-muted">{row.name}</p> : null}
                </div>
                <p className="text-sm text-ink">{row.plan}</p>
                <p className="text-sm text-ink">{STATUS_LABEL[row.status] ?? row.status}</p>
                <p className="text-sm text-muted">Verlängerung {formatWhen(row.renews)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="border border-line bg-card p-6">
        <h2 className="text-lg font-semibold text-ink">Käufe</h2>
        <p className="mt-2 text-sm text-muted">Abgeschlossene Zahlungen, neueste zuerst.</p>
        {purchases.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Noch kein Kauf.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {purchases.map((row) => (
              <li key={`${row.email}-${row.createdAt}-${row.product}`} className="grid gap-2 py-4 sm:grid-cols-[1.4fr_1fr_0.7fr_0.7fr]">
                <p className="text-sm text-ink">{row.email || "Ohne E-Mail"}</p>
                <p className="text-sm text-ink">
                  {row.product}
                  <span className="text-muted"> · {row.mode === "subscription" ? "Abo" : "Einmal"}</span>
                </p>
                <p className="text-sm text-ink">{formatMoney(row.amount, row.currency)}</p>
                <p className="text-sm text-muted">{formatWhen(row.createdAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
