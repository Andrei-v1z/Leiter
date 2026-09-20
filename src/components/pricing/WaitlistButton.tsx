"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface WaitlistButtonProps {
  planName: string;
  planSlug: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "on-ink";
  className?: string;
  noteClassName?: string;
}

export function WaitlistButton({
  planName,
  planSlug,
  children,
  variant = "outline",
  className,
  noteClassName,
}: WaitlistButtonProps) {
  const [open, setOpen] = useState(false);
  const onClose = useCallback(() => setOpen(false), []);

  return (
    <div>
      <Button type="button" variant={variant} className={className} onClick={() => setOpen(true)}>
        {children}
      </Button>
      <p className={cn("mt-3 max-w-sm text-xs leading-relaxed text-muted", noteClassName)}>
        Kauf ist noch nicht möglich. Hinterlassen Sie Ihre E-Mail für den Start-Newsletter.
      </p>
      <WaitlistDialog
        open={open}
        onClose={onClose}
        planName={planName}
        planSlug={planSlug}
      />
    </div>
  );
}

function WaitlistDialog({
  open,
  onClose,
  planName,
  planSlug,
}: {
  open: boolean;
  onClose: () => void;
  planName: string;
  planSlug: string;
}) {
  const titleId = useId();
  const emailId = `${titleId}-email`;
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    setEmail("");
    setConsent(false);
    setStatus("idle");
    setError("");

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (status === "saving") return;

    setError("");
    setStatus("saving");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan: planSlug }),
      });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setStatus("idle");
        setError(data.error || "Die Anmeldung ist fehlgeschlagen. Bitte versuchen Sie es erneut.");
        return;
      }

      setStatus("done");
    } catch {
      setStatus("idle");
      setError("Die Anmeldung ist fehlgeschlagen. Bitte versuchen Sie es erneut.");
    }
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label="Fenster schließen"
        className="absolute inset-0 bg-navy/55"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md border border-line bg-card p-6 text-ink shadow-[0_24px_80px_rgba(11,18,32,0.28)] sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <p className="eyebrow">Newsletter</p>
          <button
            type="button"
            onClick={onClose}
            className="meta text-muted transition-colors hover:text-ink"
          >
            Schließen
          </button>
        </div>

        {status === "done" ? (
          <div className="mt-6">
            <h2 id={titleId} className="display text-3xl text-ink">
              Danke.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Wir schreiben Ihnen, sobald Leiter startet und {planName} verfügbar ist.
            </p>
            <Button type="button" className="mt-8 w-full" onClick={onClose}>
              Fenster schließen
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6">
            <h2 id={titleId} className="display text-3xl text-ink">
              {planName} merken
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Kauf und Zahlung sind noch nicht möglich. Geben Sie Ihre E-Mail-Adresse ein, damit wir
              Sie benachrichtigen, sobald die Software startet.
            </p>

            <label className="mt-7 block text-sm text-ink" htmlFor={emailId}>
              E-Mail-Adresse
            </label>
            <input
              id={emailId}
              type="email"
              required
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ihre@email.de"
              className="field mt-2"
            />

            <label className="mt-5 flex items-start gap-3 text-sm leading-relaxed text-muted">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
                className="mt-1 accent-brass"
              />
              <span>
                Ich willige ein, per E-Mail über den Start von Leiter informiert zu werden. Details in
                der{" "}
                <Link href="/datenschutz" className="text-ink underline" onClick={onClose}>
                  Datenschutzerklärung
                </Link>
                .
              </span>
            </label>

            {error && <p className="mt-4 text-sm text-error">{error}</p>}

            <Button type="submit" className="mt-8 w-full" disabled={status === "saving"}>
              {status === "saving" ? "Wird gesendet…" : "Für den Newsletter anmelden"}
            </Button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
