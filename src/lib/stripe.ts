import Stripe from "stripe";
import { loadLocalEnv } from "./load-env";
import { publicSiteUrl } from "./site-url";

export function getStripe() {
  loadLocalEnv();
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(key);
}

export function getSiteUrl() {
  loadLocalEnv();
  const site = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!site) return "http://localhost:3000";
  try {
    if (new URL(site).hostname.replace(/^www\./, "") === "leiter.fr") {
      return publicSiteUrl();
    }
  } catch {
    return publicSiteUrl();
  }
  return site.replace(/\/$/, "");
}
