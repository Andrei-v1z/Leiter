import { Button } from "@/components/ui/Button";
import { FadeBlur } from "@/components/ui/FadeBlur";
import { CHECKOUT_UNAVAILABLE_MESSAGE } from "@/lib/checkout-availability";

export default function CheckoutCanceledPage() {
  return (
    <section className="section-padding">
      <FadeBlur className="page-wrap max-w-xl" immediate>
        <p className="eyebrow">Zahlung</p>
        <h1 className="display mt-6 text-4xl text-ink sm:text-5xl">Noch nicht verfügbar.</h1>
        <p className="mt-6 leading-relaxed text-muted">{CHECKOUT_UNAVAILABLE_MESSAGE}</p>
        <div className="mt-10">
          <Button href="/preise">Zurück zu den Preisen</Button>
        </div>
      </FadeBlur>
    </section>
  );
}
