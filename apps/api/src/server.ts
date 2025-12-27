import { app } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "@/core/logger.js";

app.listen(env.PORT, () => {
  logger.info("Server started at http://localhost:" + env.PORT);
});
