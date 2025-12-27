import { Request, Response, NextFunction } from "express";
import { logger } from "@/core/logger.js";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;

    logger.info({
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      duration,
      // @ts-ignore
      userId: req.auth?.userId,
    });
  });

  next();
}
