"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { PricingConfig, VolumeTier, CategoryPrice, SubscriptionPlan } from "@/lib/pricing-types";

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadConfig(adminToken: string) {
    const res = await fetch("/api/admin/pricing", {
      headers: { "x-admin-token": adminToken },
    });
    if (!res.ok) {
      setMessage("Ungültiger Admin-Token");
      return false;
    }
    const data = (await res.json()) as PricingConfig;
    setConfig(data);
    setAuthenticated(true);
    setMessage("");
    return true;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    await loadConfig(token);
  }

  async function handleSave() {
    if (!config) return;
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/admin/pricing", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": token,
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
          <h1 className="display text-4xl text-ink">Admin: Preiskonfiguration</h1>
          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm text-muted">Admin-Token</label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="mt-2 w-full field"
                placeholder="leiter-admin-dev"
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

        {/* Single Lead */}
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

        {/* Volume Tiers */}
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

        {/* Categories */}
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

        {/* Subscriptions */}
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
                      updateSubscription(
                        i,
                        "features",
                        e.target.value.split("\n").filter(Boolean)
                      )
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
      </div>
    </section>
  );
}
