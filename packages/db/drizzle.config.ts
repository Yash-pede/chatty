import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: {
    ssl: {
      rejectUnauthorized: false,
    },
    url: process.env.DATABASE_URL!,
  },
  dialect: "postgresql",
  migrations: {
    schema: "public",
  },
  out: "./drizzle",
  schema: "./src/schema.ts",
  strict: true,
  verbose: true,
});
