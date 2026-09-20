import type { NextConfig } from "next";

const pagesBasePath = process.env.PAGES_BASE_PATH || "";

const nextConfig: NextConfig = {
  ...(process.env.IONOS_STANDALONE === "1" ? { output: "standalone" as const } : {}),
  ...(pagesBasePath
    ? { basePath: pagesBasePath, assetPrefix: pagesBasePath }
    : {}),
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    return [{ source: "/favicon.ico", destination: "/favicon.svg" }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "Content-Security-Policy", value: "upgrade-insecure-requests" }],
      },
    ];
  },
};

export default nextConfig;
