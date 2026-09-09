import { promises as fs } from "fs";
import path from "path";
import type { PricingConfig } from "./pricing-types";
import { defaultPricingConfig, PRICING_SCHEMA_VERSION } from "./pricing-defaults";

const DATA_DIR = path.join(process.cwd(), "data");
const PRICING_FILE = path.join(DATA_DIR, "pricing.json");

function schemaVersionOf(config: Partial<PricingConfig> | undefined): number {
  return config?.settings?.schemaVersion ?? 0;
}

async function writeDefaults(): Promise<PricingConfig> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    PRICING_FILE,
    JSON.stringify(defaultPricingConfig, null, 2),
    "utf-8"
  );
  return defaultPricingConfig;
}

async function ensureDataFile(): Promise<void> {
  try {
    await fs.access(PRICING_FILE);
  } catch {
    await writeDefaults();
  }
}

export async function getPricingConfig(): Promise<PricingConfig> {
  await ensureDataFile();
  const raw = await fs.readFile(PRICING_FILE, "utf-8");
  const parsed = JSON.parse(raw) as Partial<PricingConfig>;

  if (schemaVersionOf(parsed) < PRICING_SCHEMA_VERSION) {
    return writeDefaults();
  }

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
      schemaVersion: PRICING_SCHEMA_VERSION,
    },
  };
}

export async function updatePricingConfig(
  config: PricingConfig
): Promise<PricingConfig> {
  const next: PricingConfig = {
    ...config,
    settings: {
      ...config.settings,
      schemaVersion: PRICING_SCHEMA_VERSION,
    },
  };
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(PRICING_FILE, JSON.stringify(next, null, 2), "utf-8");
  return next;
}
