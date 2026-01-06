import type { InferSelectModel } from "drizzle-orm";
import { users } from "./schema.js";

export type User = InferSelectModel<typeof users>;
