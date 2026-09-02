import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "on-ink";

interface ButtonProps {
  href?: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary: "bg-navy text-card hover:bg-[#151d2e]",
  secondary: "bg-card text-ink border border-line hover:border-navy",
  outline: "border border-ink/20 text-ink hover:border-ink hover:bg-navy hover:text-card bg-transparent",
  ghost: "text-muted hover:text-ink",
  "on-ink": "bg-card text-navy hover:bg-paper",
};

export function Button({
  href,
  children,
  variant = "primary",
  className,
  onClick,
  type = "button",
  disabled = false,
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center px-8 py-3 text-[13px] font-medium tracking-[0.02em] transition-colors duration-200",
    variants[variant],
    disabled && "pointer-events-none opacity-50",
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
