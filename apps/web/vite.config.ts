import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
  ],
  resolve: {
    alias: {
      "@repo/ui": path.resolve(__dirname, "../../packages/ui/src"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: path.resolve(__dirname, "./postcss.config.mjs"),
  },
  server: {
    port: 3000,
  },
});
