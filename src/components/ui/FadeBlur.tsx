"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FadeBlurProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  immediate?: boolean;
  id?: string;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function reveal(el: HTMLElement) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.classList.add("is-visible");
    });
  });
}

export function FadeBlur({
  children,
  className,
  delay = 0,
  immediate = false,
  id,
}: FadeBlurProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.classList.add("is-visible");
      return;
    }

    if (immediate) {
      reveal(el);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        reveal(el);
        observer.disconnect();
      },
      { threshold: 0.05, rootMargin: "0px 0px -48px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [immediate]);

  const style: CSSProperties | undefined = delay
    ? { animationDelay: `${delay}ms` }
    : undefined;

  return (
    <div id={id} ref={ref} className={cn("fade-blur", className)} style={style}>
      {children}
    </div>
  );
}
