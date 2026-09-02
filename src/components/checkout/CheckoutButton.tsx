"use client";

import { useState } from "react";
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

  async function startCheckout() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, slug, quantity }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
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
          void startCheckout();
        }}
      >
        {loading ? "Weiter zu Stripe…" : children}
      </Button>
      {!compact && (
        <p className={cn("mt-3 max-w-sm text-xs leading-relaxed text-muted", noteClassName)}>
          Mit dem Kauf gelten die{" "}
          <Link href="/agb" className="underline underline-offset-2">
            AGB
          </Link>
          . Rückerstattungen sind ausgeschlossen, da digitale Lead-Daten verkauft werden.
        </p>
      )}
      {error && <p className="mt-2 text-xs text-error">{error}</p>}
    </div>
  );
}
