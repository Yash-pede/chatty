import express from "express";
import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import "dotenv/config";
import { requestLogger } from "@/middlewares/requestLogger.js";
import { errorMiddleware } from "@/middlewares/error.middleware.js";
import { registerRoutes } from "@/routes.js";
import { logger } from "@/core/logger.js";
import webhookRouter from "@/modules/webhook/webhook.router.js";
import http from "http";
import { socketServer } from "@/ws/socket.instance.js";

const app = express();
export const server = http.createServer(app);
socketServer.init(server);

app.use(
  cors({
    origin: "*",
    // credentials: true,
  }),
);

app.use(requestLogger);
app.use(clerkMiddleware());

app.disable("x-powered-by");
// WEBHOOKS
app.use(webhookRouter);

app.get("/health", (_, res) => {
  res.status(200).send("ok");
});

app.get("/", async (req, res) => {
  logger.info("THE SERVER IS UP AND HEALTHY");
  res.status(200).send("THE SERVER IS UP AND HEALTHY");
});

app.use(express.json());

registerRoutes(app);

app.use(errorMiddleware);
