import { promises as fs } from "fs";
import path from "path";
import type { OutreachSend } from "@/lib/lead-outreach-email";

const LOG_FILE = path.join(process.cwd(), "data", "outreach-log.json");

type LogFile = { sends: OutreachSend[] };

export async function listOutreachSends(): Promise<OutreachSend[]> {
  try {
    const raw = await fs.readFile(LOG_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<LogFile>;
    if (!Array.isArray(parsed.sends)) return [];
    return parsed.sends
      .filter(
        (row): row is OutreachSend =>
          !!row && typeof row.email === "string" && typeof row.createdAt === "string"
      )
      .slice(-30)
      .reverse();
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return [];
    throw error;
  }
}
