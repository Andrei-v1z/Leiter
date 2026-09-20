import Link from "next/link";
import { FadeBlur } from "@/components/ui/FadeBlur";

export function Footer() {
  return (
    <footer className="ink-panel mt-auto">
      <FadeBlur className="page-wrap px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="flex flex-col gap-14 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="display text-3xl text-card">Leiter</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-card/55">
              Frische Leads. Echte Nachfrage. Mehr Chancen.
            </p>
            <p className="display mt-5 italic text-xl text-brass">Timing entscheidet.</p>
          </div>

          <div className="flex gap-16">
            <div>
              <p className="meta text-card/40">Navigation</p>
              <ul className="mt-4 space-y-2 text-sm text-card/70">
                <li>
                  <Link href="/preise" prefetch={false} className="hover:text-card">
                    Preise
                  </Link>
                </li>
                <li>
                  <Link href="/preise#abos" prefetch={false} className="hover:text-card">
                    Abos
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="meta text-card/40">Rechtliches</p>
              <ul className="mt-4 space-y-2 text-sm text-card/70">
                <li>
                  <Link href="/impressum" className="hover:text-card">
                    Impressum
                  </Link>
                </li>
                <li>
                  <Link href="/datenschutz" className="hover:text-card">
                    Datenschutz
                  </Link>
                </li>
                <li>
                  <Link href="/agb" className="hover:text-card">
                    AGB
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-white/10 pt-8">
          <p className="meta text-card/35">
            © 2026 Leiter · Bright Pixel Advertisement Agency LLC.
          </p>
        </div>
      </FadeBlur>
    </footer>
  );
}
