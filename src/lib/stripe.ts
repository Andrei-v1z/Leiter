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
    const host = new URL(site).hostname.replace(/^www\./, "").toLowerCase();
    if (host === "localhost" || host === "127.0.0.1") return site.replace(/\/$/, "");
    if (host === "leiter.fr" || host === "leiter.be") return "https://leiter.fr";
  } catch {
    return publicSiteUrl();
  }
  return site.replace(/\/$/, "");
}
