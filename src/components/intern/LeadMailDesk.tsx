"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  LEAD_EMAIL_SUBJECT,
  cleanOutreachName,
  renderLeadEmail,
  type OutreachSend,
} from "@/lib/lead-outreach-email";
import { parseOutreachCsv, sendableRecipients, type CsvRecipient } from "@/lib/outreach-csv";

function authHeaders(user: string, password: string) {
  return {
    "x-admin-user": user,
    "x-admin-password": password,
  };
}

function berlinKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function berlinClock(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function dayLabel(key: string, today: string): string {
  const [year, month, day] = key.split("-").map(Number);
  const pretty = new Intl.DateTimeFormat("de-DE", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(year, month - 1, day)));
  if (key === today) return `Heute, ${pretty}`;
  const [todayYear, todayMonth, todayDay] = today.split("-").map(Number);
  const yesterday = new Date(Date.UTC(todayYear, todayMonth - 1, todayDay));
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  if (key === yesterday.toISOString().slice(0, 10)) return `Gestern, ${pretty}`;
  return pretty;
}

function groupSendsByDay(sends: OutreachSend[]): { key: string; label: string; rows: OutreachSend[] }[] {
  const today = berlinKey(new Date());
  const groups: { key: string; label: string; rows: OutreachSend[] }[] = [];
  for (const row of sends) {
    const date = new Date(row.createdAt);
    const key = Number.isNaN(date.getTime()) ? "unbekannt" : berlinKey(date);
    const current = groups[groups.length - 1];
    if (!current || current.key !== key) {
      groups.push({ key, label: key === "unbekannt" ? "Ohne Datum" : dayLabel(key, today), rows: [row] });
    } else {
      current.rows.push(row);
    }
  }
  return groups;
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
  const [rows, setRows] = useState<CsvRecipient[]>([]);
  const [listMessage, setListMessage] = useState("");
  const [listOk, setListOk] = useState(false);
  const [listSending, setListSending] = useState(false);

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

  function handleCsv(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setListMessage("");
    setListOk(false);
    if (!file) {
      setRows([]);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      setRows(parseOutreachCsv(text));
    };
    reader.readAsText(file);
  }

  async function handleListSend() {
    const recipients = sendableRecipients(rows);
    if (recipients.length === 0) return;
    setListSending(true);
    setListMessage("");
    setListOk(false);
    const response = await fetch("/api/admin/outreach/batch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(user, password),
      },
      body: JSON.stringify({
        recipients: recipients.map((row) => ({
          email: row.email,
          name: cleanOutreachName(row.name) ?? "",
        })),
      }),
    });
    const data = (await response.json().catch(() => null)) as {
      error?: string;
      sent?: number;
      sends?: OutreachSend[];
      results?: { email: string; ok: boolean; error: string }[];
    } | null;
    setListSending(false);
    if (!response.ok || !data?.results) {
      setListMessage(data?.error || "Die Liste konnte nicht gesendet werden.");
      return;
    }
    const byEmail = new Map(data.results.map((row) => [row.email, row]));
    setRows((current) =>
      current.map((row) => {
        const result = byEmail.get(row.email);
        if (!result || row.problem === "Doppelt" || row.problem === "Keine gültige E-Mail") return row;
        if (result.ok) return { ...row, problem: "Gesendet" };
        return { ...row, problem: result.error };
      })
    );
    if (data.sends) setSends(data.sends);
    const failed = data.results.filter((row) => !row.ok).length;
    setListOk(failed === 0);
    setListMessage(
      failed === 0
        ? `Gesendet an ${data.sent ?? recipients.length}.`
        : `${data.sent ?? 0} gesendet, ${failed} nicht.`
    );
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
            <h2 className="text-lg font-semibold text-ink">Liste</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              CSV mit Spalten E-Mail und Name. Prüfe die Liste, danach geht jede Mail raus. Höchstens 20 pro Stunde.
            </p>
            <label className="mt-4 block text-sm text-muted" htmlFor="outreach-csv">
              CSV-Datei
            </label>
            <input
              id="outreach-csv"
              type="file"
              accept=".csv,text/csv"
              onChange={handleCsv}
              className="mt-2 block w-full text-sm text-ink"
            />
            {rows.length > 0 && (
              <div className="mt-4 max-h-80 overflow-auto border border-line">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 bg-card">
                    <tr className="border-b border-line text-muted">
                      <th className="px-3 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium">E-Mail</th>
                      <th className="px-3 py-2 font-medium">Prüfung</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr
                        key={`${row.line}-${row.email}`}
                        className="cursor-pointer border-b border-line last:border-0"
                        onClick={() => {
                          setEmail(row.email);
                          if (cleanOutreachName(row.name)) setName(row.name);
                        }}
                      >
                        <td className="px-3 py-2 text-ink">{row.name || "—"}</td>
                        <td className="px-3 py-2 text-ink">{row.email || "—"}</td>
                        <td className={`px-3 py-2 ${row.problem && row.problem !== "Gesendet" ? "text-error" : "text-brass"}`}>
                          {row.problem || "Bereit"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Button
              type="button"
              className="mt-4"
              disabled={listSending || sendableRecipients(rows).length === 0}
              onClick={handleListSend}
            >
              {listSending ? "Senden…" : `An ${sendableRecipients(rows).length} senden`}
            </Button>
            {listMessage && <p className={`mt-3 text-sm ${listOk ? "text-brass" : "text-error"}`}>{listMessage}</p>}
          </div>
        <div className="mt-8 border-t border-line pt-6">
          <h2 className="text-lg font-semibold text-ink">Antworten</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Eine Antwort geht an Janice@leiter.fr. support@brightpixel.agency bekommt eine Kopie. Bei einer Liste ist es eine Kopie für die ganze Liste, sonst landen zehn gleiche Mails im Spam.
          </p>
        </div>
        <div className="mt-8 border-t border-line pt-6">
          <h2 className="text-lg font-semibold text-ink">Zuletzt gesendet</h2>
          {sends.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Noch keine Mail.</p>
          ) : (
            <div className="mt-4 space-y-6">
              {groupSendsByDay(sends).map((group) => (
                <section key={group.key}>
                  <p className="text-sm text-muted">
                    {group.label}
                    <span> · {group.rows.length}</span>
                  </p>
                  <ul className="mt-1 divide-y divide-line">
                    {group.rows.map((row) => (
                      <li key={`${row.email}-${row.createdAt}`} className="flex flex-wrap items-baseline justify-between gap-2 py-2 text-sm">
                        <span className="text-ink">
                          {row.email}
                          {row.name ? <span className="text-muted"> · {row.name}</span> : null}
                        </span>
                        <span className="meta text-muted">{berlinClock(row.createdAt)}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
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
