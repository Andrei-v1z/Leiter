"use client";

import { Button } from "@/components/ui/Button";
import { CHECKOUT_UNAVAILABLE_MESSAGE } from "@/lib/checkout-availability";
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
  children,
  variant = "primary",
  className,
  noteClassName,
  compact = false,
}: CheckoutButtonProps) {
  return (
    <div>
      <Button type="button" variant={variant} className={className} disabled>
        {children}
      </Button>
      <p className={cn("mt-3 max-w-sm text-xs leading-relaxed text-muted", noteClassName)}>
        {compact ? "Bald verfügbar." : CHECKOUT_UNAVAILABLE_MESSAGE}
      </p>
    </div>
  );
}
