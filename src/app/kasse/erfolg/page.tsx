import { Button } from "@/components/ui/Button";

export default function CheckoutSuccessPage() {
  return (
    <section className="section-padding">
      <div className="page-wrap max-w-xl">
        <p className="eyebrow">Zahlung</p>
        <h1 className="display mt-6 text-4xl text-ink sm:text-5xl">Zahlung eingegangen.</h1>
        <p className="mt-6 leading-relaxed text-muted">
          Vielen Dank. Der Zugang zu den gekauften Lead-Daten wird über Ihr Dashboard
          bereitgestellt. Digitale Datenverkäufe sind von der Rückerstattung ausgeschlossen.
          Details stehen in den AGB.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button href="/preise">Weitere Leads ansehen</Button>
          <Button href="/" variant="outline">
            Zur Startseite
          </Button>
        </div>
      </div>
    </section>
  );
}
