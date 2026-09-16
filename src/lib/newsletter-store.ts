import { promises as fs } from "fs";
import path from "path";
import {
  subscribersToCsv,
  subscribersToEmailList,
  type NewsletterSubscriber,
} from "./newsletter";

const DATA_DIR = path.join(process.cwd(), "data");
const NEWSLETTER_FILE = path.join(DATA_DIR, "newsletter.json");
const NEWSLETTER_CSV = path.join(DATA_DIR, "newsletter.csv");
const NEWSLETTER_EMAILS = path.join(DATA_DIR, "emails.txt");

type NewsletterFile = {
  subscribers: NewsletterSubscriber[];
};

async function readFile(): Promise<NewsletterFile> {
  try {
    const raw = await fs.readFile(NEWSLETTER_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<NewsletterFile>;
    if (!Array.isArray(parsed.subscribers)) {
      return { subscribers: [] };
    }
    return { subscribers: parsed.subscribers };
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return { subscribers: [] };
    throw error;
  }
}

async function writeFile(data: NewsletterFile): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(NEWSLETTER_FILE, JSON.stringify(data, null, 2), "utf-8");
  await fs.writeFile(NEWSLETTER_CSV, subscribersToCsv(data.subscribers), "utf-8");
  await fs.writeFile(NEWSLETTER_EMAILS, subscribersToEmailList(data.subscribers), "utf-8");
}

export async function subscribeToNewsletter(
  email: string,
  plan: string
): Promise<{ already: boolean }> {
  const data = await readFile();
  const exists = data.subscribers.some((row) => row.email === email);
  if (exists) return { already: true };

  data.subscribers.push({
    email,
    plan,
    createdAt: new Date().toISOString(),
  });
  await writeFile(data);
  return { already: false };
}

export async function listNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
  const data = await readFile();
  return data.subscribers;
}
