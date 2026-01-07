import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/schema.ts", "src/types.ts", "src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  target: "es2022",
});
