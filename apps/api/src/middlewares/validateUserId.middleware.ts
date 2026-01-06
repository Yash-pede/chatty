import { NextFunction, Request, Response } from "express";
import { param, validationResult } from "express-validator";

export const validateUserIdMiddleware = [
  param("userId")
    .trim()
    .notEmpty()
    .withMessage("userId is required")
    .matches(/^user_[a-zA-Z0-9]+$/)
    .withMessage("Invalid userId format"),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Invalid request parameters",
        errors: errors.array(),
      });
    }
    next();
  },
];
