import Link from "next/link";

const navLinks = [
  { href: "/preise", label: "Preise" },
  { href: "/preise#abos", label: "Abos" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
      <div className="page-wrap flex items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-baseline gap-1">
          <span className="display text-[1.7rem] leading-none text-ink">Leiter</span>
          <span className="meta text-muted">.be</span>
        </Link>

        <nav className="flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="meta text-muted transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/preise"
            className="bg-navy px-5 py-2 text-[13px] font-medium tracking-wide text-card transition-colors duration-200 hover:bg-navy/90"
          >
            Leads entdecken
          </Link>
        </nav>
      </div>
    </header>
  );
}
