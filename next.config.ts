import type { NextConfig } from "next";

const pagesBasePath = process.env.PAGES_BASE_PATH || "";

const nextConfig: NextConfig = {
  ...(process.env.IONOS_STANDALONE === "1" ? { output: "standalone" as const } : {}),
  ...(pagesBasePath
    ? { basePath: pagesBasePath, assetPrefix: pagesBasePath }
    : {}),
  images: { unoptimized: true },
};

export default nextConfig;
