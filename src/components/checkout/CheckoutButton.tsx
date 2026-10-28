"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type CheckoutKind = "single" | "volume" | "exclusive" | "category" | "subscription";

interface CheckoutButtonProps {
  kind: CheckoutKind;
  slug?: string;
  quantity?: number;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "on-ink";
  className?: string;
  noteClassName?: string;
  compact?: boolean;
}

export function CheckoutButton({
  kind,
  slug,
  quantity,
  children,
  variant = "primary",
  className,
  noteClassName,
  compact = false,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const close = useCallback(() => setOpen(false), []);

  async function startCheckout(email?: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, slug, quantity, email }),
      });
      const data = (await res.json()) as { url?: string; error?: string; confirmEmail?: boolean; message?: string };
      if (!res.ok) {
        setError(data.error ?? "Checkout fehlgeschlagen.");
        return;
      }
      if (data.confirmEmail) {
        setError("");
        setOpen(true);
        setConfirmMessage(data.message ?? "Bitte bestätigen Sie den Wechsel über den Link in Ihrer E-Mail.");
        setSent(true);
        return;
      }
      if (!data.url) {
        setError(data.error ?? "Checkout fehlgeschlagen.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Verbindung zu Stripe fehlgeschlagen.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button
        type="button"
        variant={variant}
        className={className}
        disabled={loading}
        onClick={() => {
          if (kind === "subscription") {
            setSent(false);
            setConfirmMessage("");
            setError("");
            setOpen(true);
            return;
          }
          void startCheckout();
        }}
      >
        {loading ? "Weiter zu Stripe…" : children}
      </Button>
      {!compact && (
        <p className={cn("mt-3 max-w-sm text-xs leading-relaxed text-muted", noteClassName)}>
          {kind === "subscription"
            ? "Ein Abo pro Kunde. Ein Wechsel gilt ab dem nächsten Abrechnungsmonat. "
            : null}
          Mit dem Kauf gelten die{" "}
          <Link href="/agb" className="underline underline-offset-2">
            AGB
          </Link>
          . Rückerstattungen sind ausgeschlossen, da digitale Lead-Daten verkauft werden.
        </p>
      )}
      {error && !open && <p className="mt-2 text-xs text-error">{error}</p>}
      {kind === "subscription" && (
        <SubscriptionEmailDialog
          open={open}
          loading={loading}
          error={error}
          sent={sent}
          message={confirmMessage}
          onClose={close}
          onSubmit={(email) => {
            void startCheckout(email);
          }}
        />
      )}
    </div>
  );
}

function SubscriptionEmailDialog({
  open,
  loading,
  error,
  sent,
  message,
  onClose,
  onSubmit,
}: {
  open: boolean;
  loading: boolean;
  error: string;
  sent: boolean;
  message: string;
  onClose: () => void;
  onSubmit: (email: string) => void;
}) {
  const titleId = useId();
  const emailId = `${titleId}-email`;
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setEmail("");
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

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <button type="button" aria-label="Fenster schließen" className="absolute inset-0 bg-navy/55" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-md border border-line bg-card p-6 text-ink shadow-[0_24px_80px_rgba(11,18,32,0.28)] sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <p className="eyebrow">Abo</p>
          <button type="button" onClick={onClose} className="meta text-muted transition-colors hover:text-ink">
            Schließen
          </button>
        </div>
        {sent ? (
          <div className="mt-6">
            <h2 id={titleId} className="display text-3xl text-ink">
              E-Mail prüfen
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">{message}</p>
            <Button type="button" className="mt-8 w-full" onClick={onClose}>
              Fenster schließen
            </Button>
          </div>
        ) : (
          <form
            className="mt-6"
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit(email);
            }}
          >
            <h2 id={titleId} className="display text-3xl text-ink">
              Welches Abo gilt für Sie?
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Mit dieser E-Mail-Adresse kann nur ein Abo laufen. Wenn Sie bereits eines haben, merken wir den Wechsel
              für den nächsten Abrechnungsmonat vor.
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
            {error && <p className="mt-4 text-sm text-error">{error}</p>}
            <Button type="submit" className="mt-8 w-full" disabled={loading}>
              {loading ? "Wird geprüft…" : "Weiter"}
            </Button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
