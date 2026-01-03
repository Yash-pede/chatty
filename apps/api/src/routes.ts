import { Express } from "express";
import userRouter from "@/modules/user/user.router.js";
import { requireAuth } from "@clerk/express";

export function registerRoutes(app: Express) {
  app.use("/api/users", requireAuth(), userRouter);
}
