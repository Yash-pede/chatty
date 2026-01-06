import { Express } from "express";
import userRouter from "@/modules/user/user.router.js";
import { clerkAuthMiddleware } from "@/middlewares/clerk.auth.middleware.js";

export function registerRoutes(app: Express) {
  app.use("/api/users", clerkAuthMiddleware, userRouter);
}
