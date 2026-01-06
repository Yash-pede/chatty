import { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";

export function clerkAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const auth = getAuth(req);

  if (!auth.isAuthenticated) {
    return res.status(401).send("User not authenticated");
  }

  return next();
}
