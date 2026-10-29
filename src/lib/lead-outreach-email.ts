import { isValidEmail, normalizeEmail } from "@/lib/newsletter";

export const LEAD_EMAIL_SUBJECT = "Frische Anfragen, bevor der Bedarf abkühlt";

const SITE = "https://leiter.fr";

export type OutreachSend = {
  email: string;
  name: string;
  createdAt: string;
};

export function cleanOutreachName(value: string): string | null {
  const trimmed = value.replace(/[\r\n<>]/g, "").trim().slice(0, 60);
  if (!trimmed) return "";
  if (!/^[\p{L}\p{M}][\p{L}\p{M} .'-]{0,59}$/u.test(trimmed)) return null;
  return trimmed;
}

export function outreachRecipient(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = normalizeEmail(value);
  if (email.includes("\n") || email.includes("\r") || !isValidEmail(email)) return null;
  return email;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function greetingBlock(name: string): string {
  if (!name) return "";
  return `<p style="margin:16px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.3;color:#171410;">Hallo ${escapeHtml(name)},</p>`;
}

export function renderLeadEmail(template: string, name: string, imageOrigin: string): string {
  const origin = imageOrigin.replace(/\/$/, "");
  const hero = `${origin}/email/hero.jpg`;
  const desk = `${origin}/email/desk.jpg`;
  const janice = `${origin}/email/janice.jpg`;
  return template
    .replaceAll("__HERO_SRC__", hero)
    .replaceAll("__DESK_SRC__", desk)
    .replaceAll("__JANICE_SRC__", janice)
    .replaceAll("__GREETING_BLOCK__", greetingBlock(name))
    .replaceAll("__YEAR__", String(new Date().getFullYear()));
}

export function leadEmailText(name: string): string {
  const hello = name ? `Hallo ${name},\n\n` : "";
  return `${hello}Der Bedarf ist schon da. Du erfährst ihn nur zu spät.

Unternehmen und Gründer fragen heute nach Beratung. Fördermittel, Digitalisierung, Finanzierung, Wachstum, Nachfolge. Die Anfrage ist konkret. Der Moment ist kurz.

Leiter gibt dir diese Anfrage, solange sie frisch ist. Mit Kontakt. Exklusiv für dich. Keine alte Liste und kein geteilter Datensatz.

01 Die Anfrage ist von heute, nicht aus einem Archiv.
02 Den Kontakt bekommst nur du.
03 Du kaufst die Anfrage. Sonst nichts.

Was es kostet
Ein Lead: 80 €
Zugang: 240 € für 3 Leads im Monat
Atelier: 700 € für 10 Leads im Monat
Kanzlei: 1.950 € für 30 Leads im Monat
Zuzüglich MwSt. Ab fünf Leads sinkt der Preis. Abos sind monatlich kündbar.

Die Leads ansehen: ${SITE}/preise

Du bezahlst nicht für mehr Namen. Du bezahlst dafür, im richtigen Moment anzurufen.

Janice
Janice@leiter.fr
Support: +49 178 7601360
Impressum: ${SITE}/impressum
Datenschutz: ${SITE}/datenschutz

Wenn du keine Hinweise mehr möchtest, antworte kurz auf diese Mail.
`;
}

export const LEAD_EMAIL_IMAGE_ORIGIN = SITE;
