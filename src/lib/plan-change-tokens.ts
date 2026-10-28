import { promises as fs } from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "plan-change-tokens.json");

export type PlanChangeToken = {
  token: string;
  email: string;
  subscriptionId: string;
  newPriceId: string;
  extraSubscriptionIds: string[];
  expiresAt: string;
  usedAt?: string;
  resultMessage?: string;
};

type TokenFile = {
  tokens: PlanChangeToken[];
};

async function readFile(): Promise<TokenFile> {
  try {
    const raw = await fs.readFile(FILE, "utf-8");
    const parsed = JSON.parse(raw) as Partial<TokenFile>;
    if (!Array.isArray(parsed.tokens)) return { tokens: [] };
    return { tokens: parsed.tokens };
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return { tokens: [] };
    throw error;
  }
}

async function writeFile(data: TokenFile): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  const now = Date.now();
  data.tokens = data.tokens.filter((token) => {
    if (token.usedAt) return true;
    return Date.parse(token.expiresAt) > now;
  });
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function createPlanChangeToken(token: PlanChangeToken): Promise<void> {
  const data = await readFile();
  data.tokens = data.tokens.filter((row) => row.email !== token.email || row.usedAt);
  data.tokens.push(token);
  await writeFile(data);
}

export async function takePlanChangeToken(token: string): Promise<PlanChangeToken | "expired" | "missing"> {
  if (!/^[a-f0-9]{64}$/.test(token)) return "missing";
  const data = await readFile();
  const row = data.tokens.find((item) => item.token === token);
  if (!row) return "missing";
  if (row.usedAt) return row;
  if (Date.parse(row.expiresAt) <= Date.now()) return "expired";
  return row;
}

export async function completePlanChangeToken(token: string, resultMessage: string): Promise<void> {
  const data = await readFile();
  const row = data.tokens.find((item) => item.token === token);
  if (!row) return;
  row.usedAt = new Date().toISOString();
  row.resultMessage = resultMessage;
  await writeFile(data);
}
