import { env } from "./config/env.js";
import { logger } from "@/core/logger.js";
import { server } from "@/app.js";

server.listen(env.PORT, () => {
  logger.info("Server started at http://localhost:" + env.PORT);
});
