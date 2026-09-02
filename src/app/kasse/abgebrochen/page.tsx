import { Button } from "@/components/ui/Button";

export default function CheckoutCanceledPage() {
  return (
    <section className="section-padding">
      <div className="page-wrap max-w-xl">
        <p className="eyebrow">Zahlung</p>
        <h1 className="display mt-6 text-4xl text-ink sm:text-5xl">Zahlung abgebrochen.</h1>
        <p className="mt-6 leading-relaxed text-muted">
          Es wurde nichts belastet. Sie können den Kauf jederzeit erneut starten.
        </p>
        <div className="mt-10">
          <Button href="/preise">Zurück zu den Preisen</Button>
        </div>
      </div>
    </section>
  );
}
