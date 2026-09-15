import { FadeBlur } from "@/components/ui/FadeBlur";
import { LEAD_CATEGORIES } from "@/lib/lead-categories";

export function LeadCategories() {
  return (
    <section id="kategorien" className="section-padding">
      <div className="page-wrap">
        <FadeBlur>
          <p className="eyebrow">Kategorien</p>
          <h2 className="display mt-6 max-w-[16ch] text-4xl text-ink sm:text-5xl">
            Die Leads sind in diesen Kategorien.
          </h2>
        </FadeBlur>

        <ol className="mt-12 divide-y divide-line border-y border-line">
          {LEAD_CATEGORIES.map((name, index) => (
            <li key={name}>
              <FadeBlur delay={index * 40} className="grid grid-cols-[3.5rem_1fr] gap-6 py-5 sm:gap-8">
                <span className="meta pt-1 text-brass">{String(index + 1).padStart(2, "0")}</span>
                <p className="text-ink">{name}</p>
              </FadeBlur>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
