"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { PricingConfig, VolumeTier, CategoryPrice, SubscriptionPlan } from "@/lib/pricing-types";
import { subscribersToCsv, subscribersToEmailList, type NewsletterSubscriber } from "@/lib/newsletter";

function authHeaders(user: string, password: string) {
  return {
    "x-admin-user": user,
    "x-admin-password": password,
  };
}

export default function InternPage() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  async function loadConfig(adminUser: string, adminPassword: string) {
    const headers = authHeaders(adminUser, adminPassword);
    const session = await fetch("/api/admin/session", { method: "POST", headers });
    if (!session.ok) {
      setMessage("Anmeldung fehlgeschlagen.");
      return false;
    }

    const res = await fetch("/api/admin/pricing", { headers });
    if (!res.ok) {
      setMessage("Preise konnten nicht geladen werden.");
      return false;
    }
    const data = (await res.json()) as PricingConfig;
    setConfig(data);
    setAuthenticated(true);
    setMessage("");

    const newsletterRes = await fetch("/api/admin/newsletter", { headers });
    if (newsletterRes.ok) {
      const newsletter = (await newsletterRes.json()) as { subscribers?: NewsletterSubscriber[] };
      setSubscribers(newsletter.subscribers ?? []);
    }
    return true;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    await loadConfig(user, password);
  }

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/pricing", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(user, password),
      },
      body: JSON.stringify(config),
    });
    setSaving(false);
    if (res.ok) {
      setMessage("Preise erfolgreich gespeichert.");
    } else {
      setMessage("Fehler beim Speichern.");
    }
  }

  function downloadCsv() {
    const blob = new Blob([subscribersToCsv(subscribers)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "leiter-newsletter.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function copyEmails() {
    const list = subscribersToEmailList(subscribers).trim();
    if (!list) return;
    try {
      await navigator.clipboard.writeText(list);
      setCopyMessage("Adressen kopiert.");
    } catch {
      setCopyMessage("Kopieren fehlgeschlagen.");
    }
  }

  function updateVolumeTier(index: number, field: keyof VolumeTier, value: string | number | null) {
    if (!config) return;
    const tiers = [...config.volumeTiers];
    tiers[index] = { ...tiers[index], [field]: value };
    setConfig({ ...config, volumeTiers: tiers });
  }

  function updateCategory(index: number, field: keyof CategoryPrice, value: string | number) {
    if (!config) return;
    const categories = [...config.categories];
    categories[index] = { ...categories[index], [field]: value };
    setConfig({ ...config, categories });
  }

  function updateSubscription(
    index: number,
    field: keyof SubscriptionPlan,
    value: string | number | boolean | string[] | null
  ) {
    if (!config) return;
    const subscriptions = [...config.subscriptions];
    subscriptions[index] = { ...subscriptions[index], [field]: value };
    setConfig({ ...config, subscriptions });
  }

  if (!authenticated) {
    return (
      <section className="section-padding">
        <div className="mx-auto max-w-md">
          <h1 className="display text-4xl text-ink">Anmelden</h1>
          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm text-muted" htmlFor="intern-user">
                Benutzer
              </label>
              <input
                id="intern-user"
                type="text"
                autoComplete="username"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="mt-2 w-full field"
              />
            </div>
            <div>
              <label className="block text-sm text-muted" htmlFor="intern-password">
                Passwort
              </label>
              <input
                id="intern-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full field"
              />
            </div>
            <Button type="submit">Anmelden</Button>
            {message && <p className="text-sm text-error">{message}</p>}
          </form>
        </div>
      </section>
    );
  }

  if (!config) return null;

  return (
    <section className="section-padding">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <h1 className="display text-4xl text-ink">Preiskonfiguration</h1>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Speichern…" : "Speichern"}
          </Button>
        </div>
        {message && (
          <p className={`mt-4 text-sm ${message.includes("erfolgreich") ? "text-brass" : "text-error"}`}>
            {message}
          </p>
        )}

        <div className="mt-12 border border-line bg-card p-6">
          <h2 className="text-lg font-semibold text-ink">Einzel-Lead Basispreis</h2>
          <div className="mt-4">
            <label className="text-sm text-muted">Preis (€)</label>
            <input
              type="number"
              value={config.singleLead.basePrice}
              onChange={(e) =>
                setConfig({
                  ...config,
                  singleLead: { ...config.singleLead, basePrice: Number(e.target.value) },
                })
              }
              className="mt-2 w-32 field"
            />
          </div>
        </div>

        <div className="mt-8 border border-line bg-card p-6">
          <h2 className="text-lg font-semibold text-ink">Mengenrabatte</h2>
          <div className="mt-4 space-y-6">
            {config.volumeTiers.map((tier, i) => (
              <div key={i} className="grid gap-4 border-b border-line pb-6 last:border-0 sm:grid-cols-4">
                <div>
                  <label className="text-xs text-muted">Menge</label>
                  <input
                    type="number"
                    value={tier.quantity}
                    onChange={(e) => updateVolumeTier(i, "quantity", Number(e.target.value))}
                    className="mt-1 w-full field"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted">Gesamtpreis (€)</label>
                  <input
                    type="number"
                    value={tier.totalPrice}
                    onChange={(e) => updateVolumeTier(i, "totalPrice", Number(e.target.value))}
                    className="mt-1 w-full field"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted">Pro Lead (€)</label>
                  <input
                    type="number"
                    value={tier.perLeadPrice}
                    onChange={(e) => updateVolumeTier(i, "perLeadPrice", Number(e.target.value))}
                    className="mt-1 w-full field"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted">Ersparnis (€)</label>
                  <input
                    type="number"
                    value={tier.savings}
                    onChange={(e) => updateVolumeTier(i, "savings", Number(e.target.value))}
                    className="mt-1 w-full field"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-muted">Badge</label>
                  <input
                    type="text"
                    value={tier.badge ?? ""}
                    onChange={(e) => updateVolumeTier(i, "badge", e.target.value || null)}
                    className="mt-1 w-full field"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 border border-line bg-card p-6">
          <h2 className="text-lg font-semibold text-ink">Kategoriepreise</h2>
          <div className="mt-4 space-y-4">
            {config.categories.map((cat, i) => (
              <div key={cat.slug} className="flex items-center gap-4">
                <input
                  type="text"
                  value={cat.name}
                  onChange={(e) => updateCategory(i, "name", e.target.value)}
                  className="flex-1 field"
                />
                <input
                  type="number"
                  value={cat.basePrice}
                  onChange={(e) => updateCategory(i, "basePrice", Number(e.target.value))}
                  className="w-24 field"
                />
                <span className="text-sm text-muted">€</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 border border-line bg-card p-6">
          <h2 className="text-lg font-semibold text-ink">Abos</h2>
          <div className="mt-6 space-y-10">
            {config.subscriptions.map((plan, i) => (
              <div key={plan.slug} className="grid gap-4 border-b border-line pb-8 last:border-0 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-muted">Name</label>
                  <input
                    type="text"
                    value={plan.name}
                    onChange={(e) => updateSubscription(i, "name", e.target.value)}
                    className="mt-1 w-full field"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted">Monatlicher Preis (€)</label>
                  <input
                    type="number"
                    value={plan.monthlyPrice}
                    onChange={(e) => updateSubscription(i, "monthlyPrice", Number(e.target.value))}
                    className="mt-1 w-full field"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted">Leads exklusiv</label>
                  <input
                    type="number"
                    value={plan.includedLeads}
                    onChange={(e) => updateSubscription(i, "includedLeads", Number(e.target.value))}
                    className="mt-1 w-full field"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted">Badge</label>
                  <input
                    type="text"
                    value={plan.badge ?? ""}
                    onChange={(e) => updateSubscription(i, "badge", e.target.value || null)}
                    className="mt-1 w-full field"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-muted">Beschreibung</label>
                  <input
                    type="text"
                    value={plan.description}
                    onChange={(e) => updateSubscription(i, "description", e.target.value)}
                    className="mt-1 w-full field"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-muted">Leistungen (eine pro Zeile)</label>
                  <textarea
                    value={plan.features.join("\n")}
                    onChange={(e) =>
                      updateSubscription(i, "features", e.target.value.split("\n").filter(Boolean))
                    }
                    rows={5}
                    className="field mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted">CTA</label>
                  <input
                    type="text"
                    value={plan.cta}
                    onChange={(e) => updateSubscription(i, "cta", e.target.value)}
                    className="mt-1 w-full field"
                  />
                </div>
                <label className="flex items-center gap-3 self-end pb-2">
                  <input
                    type="checkbox"
                    checked={plan.featured}
                    onChange={(e) => updateSubscription(i, "featured", e.target.checked)}
                    className="accent-brass"
                  />
                  <span className="text-sm text-ink">Hervorgehoben</span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 border border-line bg-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink">Start-Newsletter</h2>
              <p className="mt-2 text-sm text-muted">
                {subscribers.length} {subscribers.length === 1 ? "Adresse" : "Adressen"} für den Rollout.
              </p>
            </div>
            {subscribers.length > 0 && (
              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="outline" onClick={copyEmails}>
                  Adressen kopieren
                </Button>
                <Button type="button" variant="outline" onClick={downloadCsv}>
                  CSV herunterladen
                </Button>
              </div>
            )}
          </div>
          {copyMessage && <p className="mt-3 text-sm text-brass">{copyMessage}</p>}
          {subscribers.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Noch keine Anmeldungen.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {subscribers.map((row) => (
                <li key={`${row.email}-${row.createdAt}`} className="flex flex-wrap items-baseline justify-between gap-2 py-3 text-sm">
                  <span className="text-ink">{row.email}</span>
                  <span className="meta text-muted">
                    {row.plan || "—"} · {row.createdAt.slice(0, 10)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
