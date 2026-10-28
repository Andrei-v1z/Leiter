import type { Metadata } from "next";
import { ThankYou } from "@/components/checkout/ThankYou";

export const metadata: Metadata = {
  title: "Danke · Leiter",
  description: "Die Zahlung ist eingegangen. Vielen Dank für Ihren Kauf bei Leiter.",
};

export default function CheckoutSuccessPage() {
  return <ThankYou />;
}
