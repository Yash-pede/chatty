import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@repo/db/schema";

const db = drizzle({
  connection: process.env.DATABASE_URL!,
  casing: "snake_case",
  schema,
});
export default db;
