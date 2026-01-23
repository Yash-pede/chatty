import { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { verifyToken } from "@clerk/backend";
import type { Socket } from "socket.io";
import { env } from "@/config/env.js";
import { logger } from "@/core/logger.js";
import { ApiError } from "@/core/errors/AppError.js";

export function clerkAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const auth = getAuth(req);

  if (!auth.isAuthenticated || !auth.userId) {
    return res.status(401).send("User not authenticated");
  }

  return next();
}

export async function clerkSocketAuth(
  socket: Socket,
  next: (err?: Error) => void,
) {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new ApiError("Missing auth token", 401));
    }

    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    });

    // Attach trusted identity
    socket.data.userId = payload.sub;
    socket.data.sessionId = payload.sid;

    return next();
  } catch (err) {
    logger.error(err);
    return next(new ApiError("UNAUTHORIZED", 401));
  }
}
