import Link from "next/link";

const navLinks = [
  { href: "/preise", label: "Preise" },
  { href: "/preise#abos", label: "Abos" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="page-wrap flex items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
        <Link href="/" className="fade-blur-load">
          <span className="display text-[1.7rem] font-semibold leading-none tracking-[-0.05em] text-ink">
            Leiter
          </span>
        </Link>

        <nav className="flex items-center gap-8">
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className="meta fade-blur-load text-muted transition-colors hover:text-ink"
              style={{ animationDelay: `${80 + index * 70}ms` }}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/preise"
            className="fade-blur-load bg-navy px-5 py-2 text-[13px] font-medium tracking-wide text-card transition-colors duration-200 hover:bg-navy/90"
            style={{ animationDelay: "220ms" }}
          >
            Leads entdecken
          </Link>
        </nav>
      </div>
    </header>
  );
}
