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
  out: "../../package/db/migrations",
  schema: "../../package/db/schema.ts",
  strict: true,
  verbose: true,
});
