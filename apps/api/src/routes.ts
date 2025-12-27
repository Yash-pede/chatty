import { Express } from "express";
import userRouter from "@/modules/user/user.router.js";

export function registerRoutes(app: Express) {
  app.use("/api/users", userRouter);
}
