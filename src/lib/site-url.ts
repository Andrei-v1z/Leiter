const PRODUCTION_HOST = "leiter.fr";

export function publicSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || `https://${PRODUCTION_HOST}`;
  try {
    const url = new URL(raw);
    if (url.hostname === PRODUCTION_HOST || url.hostname.endsWith(`.${PRODUCTION_HOST}`)) {
      url.protocol = "https:";
    }
    return url.origin;
  } catch {
    return `https://${PRODUCTION_HOST}`;
  }
}
