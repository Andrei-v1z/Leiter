import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StockImageProps {
  src: string;
  alt: string;
  className?: string;
  overlay?: boolean;
  priority?: boolean;
  sizes?: string;
  children?: ReactNode;
}

export function StockImage({
  src,
  alt,
  className,
  overlay = false,
  priority = false,
  children,
}: StockImageProps) {
  return (
    <div className={cn("relative overflow-hidden bg-navy", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={cn(
          "absolute inset-0 h-full w-full object-cover fade-blur-media"
        )}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
      {overlay ? <div className="absolute inset-0 bg-navy/50" /> : null}
      {children}
    </div>
  );
}
