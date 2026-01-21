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
import { RedisManager } from "@/redis/RedisManager.js";
import { env } from "@/config/env.js";
import { getAppVersion } from "@/version.js";

const app = express();
export const server = http.createServer(app);

RedisManager.init({
  host: env.REDIS_HOST,
  port: Number(env.REDIS_PORT),
  // tls: {},
  // maxRetriesPerRequest: 3,
  // enableReadyCheck: true,
  lazyConnect: false,
});

console.log("REDIS::::", env.REDIS_HOST, env.REDIS_PORT);

socketServer.init(server);

app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);
// src/server.ts (VERY IMPORTANT: before routes)
// app.disable("etag");
//
// app.use((req, res, next) => {
//   res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
//   res.setHeader("Pragma", "no-cache");
//   res.setHeader("Expires", "0");
//   next();
// });

app.get("/eversion", async (_, res) => {
  const version = await getAppVersion();
  res.json({
    version,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/", async (req, res) => {
  logger.info("THE SERVER IS UP AND HEALTHY");
  res.status(200).send("THE SERVER IS UP AND HEALTHY");
});

app.use(requestLogger);
app.use(clerkMiddleware());

app.disable("x-powered-by");
// WEBHOOKS
app.use(webhookRouter);

app.get("/health", (_, res) => {
  res.status(200).send("ok");
});

app.use(express.json());

registerRoutes(app);

app.use(errorMiddleware);
