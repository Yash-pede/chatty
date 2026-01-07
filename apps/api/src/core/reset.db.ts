import * as schema from "@repo/db/schema";
import { reset } from "drizzle-seed";
import db from "@/config/db.drizzle.js";

async function main() {
  await reset(db, schema);
}

main();
