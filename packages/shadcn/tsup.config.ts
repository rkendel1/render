import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/catalog.ts"],
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "@json-render/core", "@json-render/react", "zod"],
});
