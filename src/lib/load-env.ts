import { existsSync, readFileSync } from "fs";
import path from "path";

let loaded = false;

export function loadLocalEnv(): void {
  if (loaded) return;
  loaded = true;

  const envPath = path.join(process.cwd(), ".env");
  if (!existsSync(envPath)) return;

  for (const raw of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
