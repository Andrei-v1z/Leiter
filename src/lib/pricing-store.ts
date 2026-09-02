import { promises as fs } from "fs";
import path from "path";
import type { PricingConfig } from "./pricing-types";
import { defaultPricingConfig } from "./pricing-defaults";

const DATA_DIR = path.join(process.cwd(), "data");
const PRICING_FILE = path.join(DATA_DIR, "pricing.json");

async function ensureDataFile(): Promise<void> {
  try {
    await fs.access(PRICING_FILE);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(
      PRICING_FILE,
      JSON.stringify(defaultPricingConfig, null, 2),
      "utf-8"
    );
  }
}

export async function getPricingConfig(): Promise<PricingConfig> {
  await ensureDataFile();
  const raw = await fs.readFile(PRICING_FILE, "utf-8");
  const parsed = JSON.parse(raw) as Partial<PricingConfig>;
  return {
    ...defaultPricingConfig,
    ...parsed,
    exclusive: {
      ...defaultPricingConfig.exclusive,
      ...parsed.exclusive,
      exampleLead: {
        ...defaultPricingConfig.exclusive.exampleLead,
        ...parsed.exclusive?.exampleLead,
      },
    },
    subscriptions: parsed.subscriptions?.length
      ? parsed.subscriptions
      : defaultPricingConfig.subscriptions,
    settings: {
      ...defaultPricingConfig.settings,
      ...parsed.settings,
    },
  };
}

export async function updatePricingConfig(
  config: PricingConfig
): Promise<PricingConfig> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(PRICING_FILE, JSON.stringify(config, null, 2), "utf-8");
  return config;
}

