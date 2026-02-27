import type { NextConfig } from "next";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  serverExternalPackages: ["@ai-sdk/openai"],
  webpack: (config) => {
    config.resolve.alias["@ai-sdk/openai"] = join(
      __dirname,
      "node_modules/@ai-sdk/openai",
    );
    return config;
  },
};

export default nextConfig;
