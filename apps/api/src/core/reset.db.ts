// path to a file with schema you want to reset
import * as schema from "@/config/database/schema.js";
import { reset } from "drizzle-seed";
import db from "@/config/db.drizzle.js";

async function main() {
  await reset(db, schema);
}

main();
