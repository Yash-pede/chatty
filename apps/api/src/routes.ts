import { Express } from "express";
import userRouter from "@/modules/user/user.router.js";
import conversationRouter from "@/modules/conversations/conversations.router.js";
import { clerkAuthMiddleware } from "@/middlewares/clerk.auth.middleware.js";

export function registerRoutes(app: Express) {
  app.use("/api/users", clerkAuthMiddleware, userRouter);
  app.use("/api/conversations", clerkAuthMiddleware, conversationRouter);
}
