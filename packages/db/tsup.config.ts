import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/schema.ts", "src/types.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  target: "es2022",
});
