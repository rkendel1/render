import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@json-render/core", "@json-render/react"],
  serverExternalPackages: ["@ai-sdk/openai"],
  webpack: (config) => {
    // Explicitly resolve @ai-sdk/openai to this package's local node_modules
    // so webpack finds it regardless of the monorepo build CWD.
    config.resolve.alias["@ai-sdk/openai"] = join(
      __dirname,
      "node_modules/@ai-sdk/openai",
    );
    return config;
  },
};

export default nextConfig;
