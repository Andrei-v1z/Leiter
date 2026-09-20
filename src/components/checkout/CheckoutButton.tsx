"use client";

import { WaitlistButton } from "@/components/pricing/WaitlistButton";

type CheckoutKind = "single" | "volume" | "exclusive" | "category" | "subscription";

interface CheckoutButtonProps {
  kind: CheckoutKind;
  slug?: string;
  quantity?: number;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "on-ink";
  className?: string;
  noteClassName?: string;
}

function waitlistMeta(kind: CheckoutKind, slug?: string, quantity?: number) {
  switch (kind) {
    case "single":
      return { planName: "Einzel-Lead", planSlug: "single-lead" };
    case "volume":
      return {
        planName: quantity ? `Lead-Paket (${quantity})` : "Lead-Paket",
        planSlug: quantity ? `volume-${quantity}` : "volume",
      };
    case "exclusive":
      return { planName: "Exklusiver Lead", planSlug: "exclusive-lead" };
    case "category":
      return {
        planName: slug || "Lead",
        planSlug: slug ? `category-${slug}` : "category",
      };
    case "subscription":
      return { planName: slug || "Abo", planSlug: slug || "subscription" };
  }
}

export function CheckoutButton({
  kind,
  slug,
  quantity,
  children,
  variant = "primary",
  className,
  noteClassName,
}: CheckoutButtonProps) {
  const { planName, planSlug } = waitlistMeta(kind, slug, quantity);

  return (
    <WaitlistButton
      planName={planName}
      planSlug={planSlug}
      variant={variant}
      className={className}
      noteClassName={noteClassName}
    >
      {children}
    </WaitlistButton>
  );
}
