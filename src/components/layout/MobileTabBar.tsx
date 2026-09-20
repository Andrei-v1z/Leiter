"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/", label: "Start", match: "home" as const },
  { href: "/preise", label: "Preise", match: "preise" as const },
  { href: "/preise#abos", label: "Abos", match: "abos" as const },
  { href: "/preise", label: "Leads", match: "leads" as const },
];

function Icon({ name, active }: { name: (typeof tabs)[number]["match"]; active: boolean }) {
  const stroke = active ? "var(--color-navy)" : "currentColor";
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-6 w-6",
    "aria-hidden": true,
  };

  if (name === "home") {
    return (
      <svg {...common}>
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
      </svg>
    );
  }
  if (name === "preise") {
    return (
      <svg {...common}>
        <path d="M12 4v16M8 8.5c0-1.4 1.8-2.5 4-2.5s4 1.1 4 2.5-1.8 2.5-4 2.5-4 1.1-4 2.5 1.8 2.5 4 2.5 4-1.1 4-2.5" />
      </svg>
    );
  }
  if (name === "abos") {
    return (
      <svg {...common}>
        <rect x="4" y="5" width="16" height="4" rx="1" />
        <rect x="4" y="11" width="16" height="4" rx="1" />
        <rect x="4" y="17" width="16" height="2" rx="1" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

export function MobileTabBar() {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [pathname]);

  return (
    <nav
      aria-label="Fußnavigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-4">
        {tabs.map((tab) => {
          const onHome = pathname === "/";
          const onPreise = pathname === "/preise";
          const active =
            tab.match === "home"
              ? onHome
              : tab.match === "abos"
                ? onPreise && hash === "#abos"
                : tab.match === "preise"
                  ? onPreise && hash !== "#abos"
                  : false;

          return (
            <li key={`${tab.match}-${tab.href}`}>
              <Link
                href={tab.href}
                prefetch={false}
                onClick={() => {
                  if (tab.href.includes("#")) {
                    setHash("#abos");
                  } else {
                    setHash("");
                  }
                }}
                className={cn(
                  "flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium tracking-wide",
                  active ? "text-navy" : "text-muted"
                )}
              >
                <Icon name={tab.match} active={active} />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
