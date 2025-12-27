import express from "express";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import "dotenv/config";
import { requestLogger } from "@/middlewares/requestLogger.js";
import { errorMiddleware } from "@/middlewares/error.middleware.js";
import { registerRoutes } from "@/routes.js";
import { logger } from "@/core/logger.js";
import webhookRouter from "@/modules/webhook/webhook.router.js";

export const app = express();

app.get("/health", (_, res) => {
  res.status(200).send("ok");
});

app.use(requestLogger);

app.get("/", async (req, res) => {
  logger.info("THE SERVER IS UP AND HEALTHY");
  res.status(200).send("THE SERVER IS UP AND HEALTHY");
});

app.use(cors());
app.use(express.json());

// WEBHOOKS
app.use(webhookRouter);

app.use(clerkMiddleware());

registerRoutes(app);

app.use(errorMiddleware);
