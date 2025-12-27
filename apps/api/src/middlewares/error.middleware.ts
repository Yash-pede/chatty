import { Request, Response, NextFunction } from "express";
import { logger } from "@/core/logger.js";

export function errorMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  logger.error(
    {
      err,
      method: req.method,
      path: req.originalUrl,
      // @ts-ignore
      userId: req.auth?.userId,
  },
    "Unhandled error",
  );

  const status = err.statusCode || 500;

  res.status(status).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
}
