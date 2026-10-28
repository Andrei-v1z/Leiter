const PRODUCTION_HOST = "leiter.fr";

function hostName(hostname: string): string {
  return hostname.replace(/^www\./, "").toLowerCase();
}

export function publicSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || `https://${PRODUCTION_HOST}`;
  try {
    const url = new URL(raw);
    const host = hostName(url.hostname);
    if (host === PRODUCTION_HOST || host === "leiter.be") {
      return `https://${PRODUCTION_HOST}`;
    }
    return url.origin;
  } catch {
    return `https://${PRODUCTION_HOST}`;
  }
}
