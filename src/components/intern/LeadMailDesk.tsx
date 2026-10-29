"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  LEAD_EMAIL_SUBJECT,
  cleanOutreachName,
  renderLeadEmail,
  type OutreachSend,
} from "@/lib/lead-outreach-email";

function authHeaders(user: string, password: string) {
  return {
    "x-admin-user": user,
    "x-admin-password": password,
  };
}

export function LeadMailDesk({ user, password }: { user: string; password: string }) {
  const [template, setTemplate] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [sends, setSends] = useState<OutreachSend[]>([]);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);
  const [onLiveSite, setOnLiveSite] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/outreach", { headers: authHeaders(user, password) })
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json()) as { sends?: OutreachSend[]; template?: string };
      })
      .then((data) => {
        if (cancelled || !data) return;
        if (data.sends) setSends(data.sends);
        if (data.template) setTemplate(data.template);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [user, password]);

  useEffect(() => {
    const host = window.location.hostname;
    setOnLiveSite(host === "leiter.fr" || host === "www.leiter.fr");
  }, []);

  const greeting = cleanOutreachName(name) ?? "";
  const preview = template ? renderLeadEmail(template, greeting, "") : "";

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    setMessage("");
    setOk(false);
    const response = await fetch("/api/admin/outreach", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(user, password),
      },
      body: JSON.stringify({ email, name }),
    });
    const data = (await response.json().catch(() => null)) as { error?: string; sends?: OutreachSend[] } | null;
    setSending(false);
    if (!response.ok) {
      setMessage(data?.error || "Die Mail konnte nicht gesendet werden.");
      return;
    }
    setOk(true);
    setMessage(`Gesendet an ${email.trim().toLowerCase()}.`);
    setEmail("");
    if (data?.sends) setSends(data.sends);
  }

  return (
    <div className="mt-10 grid items-start gap-8 lg:grid-cols-[0.82fr_1.18fr]">
      <div className="border border-line bg-card p-6">
        <p className="text-sm text-muted">Eine Adresse pro Versand. Die Mail geht so raus, wie die Vorschau sie zeigt.</p>
        <form onSubmit={handleSend} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-muted" htmlFor="outreach-email">
              Empfänger
            </label>
            <input
              id="outreach-email"
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full field"
              placeholder="name@kanzlei.de"
            />
          </div>
          <div>
            <label className="block text-sm text-muted" htmlFor="outreach-name">
              Name, falls bekannt
            </label>
            <input
              id="outreach-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full field"
              placeholder="Anna"
            />
          </div>
          <div>
            <p className="text-sm text-muted">Betreff</p>
            <p className="mt-2 text-sm text-ink">{LEAD_EMAIL_SUBJECT}</p>
          </div>
          <Button type="submit" disabled={sending}>
            {sending ? "Senden…" : "Mail senden"}
          </Button>
          {!onLiveSite && (
            <p className="text-sm text-muted">Zugestellt wird die Mail auf leiter.fr. Hier prüfst du die Vorschau.</p>
          )}
          {message && <p className={`text-sm ${ok ? "text-brass" : "text-error"}`}>{message}</p>}
        </form>
        <div className="mt-8 border-t border-line pt-6">
          <h2 className="text-lg font-semibold text-ink">Antworten</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Eine Antwort geht an Janice@leiter.fr. support@brightpixel.agency bekommt eine Blindkopie jeder gesendeten Mail. Der Empfänger sieht diese Adresse nicht.
          </p>
        </div>
        <div className="mt-8 border-t border-line pt-6">
          <h2 className="text-lg font-semibold text-ink">Zuletzt gesendet</h2>
          {sends.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Noch keine Mail.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {sends.map((row) => (
                <li key={`${row.email}-${row.createdAt}`} className="flex flex-wrap items-baseline justify-between gap-2 py-3 text-sm">
                  <span className="text-ink">
                    {row.email}
                    {row.name ? <span className="text-muted"> · {row.name}</span> : null}
                  </span>
                  <span className="meta text-muted">{row.createdAt.slice(0, 16).replace("T", " ")}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="border border-line bg-paper">
        <p className="border-b border-line px-4 py-3 text-sm text-muted">Vorschau</p>
        {preview ? (
          <iframe title="Vorschau der Vertriebsmail" srcDoc={preview} className="h-[860px] w-full bg-paper" />
        ) : (
          <p className="p-6 text-sm text-muted">Vorschau wird geladen.</p>
        )}
      </div>
    </div>
  );
}
