export const EMAIL_MAX_LENGTH = 254;

export type NewsletterSubscriber = {
  email: string;
  plan: string;
  createdAt: string;
};

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  if (email.length < 5 || email.length > EMAIL_MAX_LENGTH) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function normalizePlan(value: unknown): string {
  if (typeof value !== "string") return "";
  const plan = value.trim().toLowerCase();
  if (!/^[a-z0-9-]{0,64}$/.test(plan)) return "";
  return plan;
}

function csvCell(value: string): string {
  if (/[",\n\r]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export function subscribersToCsv(subscribers: NewsletterSubscriber[]): string {
  return [
    "email,plan,createdAt",
    ...subscribers.map((row) => [csvCell(row.email), csvCell(row.plan), csvCell(row.createdAt)].join(",")),
  ].join("\n") + (subscribers.length ? "\n" : "\n");
}

export function subscribersToEmailList(subscribers: NewsletterSubscriber[]): string {
  return subscribers.map((row) => row.email).join("\n") + (subscribers.length ? "\n" : "");
}
