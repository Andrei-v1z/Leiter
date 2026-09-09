import Stripe from "stripe";
import { loadLocalEnv } from "./load-env";

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
  if (site) return site.replace(/\/$/, "");
  return "http://localhost:3000";
}
