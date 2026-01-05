import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./database/schema.js";

const db = drizzle({
  connection: process.env.DATABASE_URL!,
  casing: "snake_case",
  schema,
});
export default db;
