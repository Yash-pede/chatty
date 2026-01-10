import { asyncHandler } from "@/core/asyncHandler.js";
import { Request, Response } from "express";
import { getUserById, updateClerkUser } from "@/modules/user/user.service.js";
import { ClerkUserUpdate } from "@repo/db/types";

export const getUserByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const userData = await getUserById(req.params.userId);
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: userData,
    });
  },
);

export const updateClerkUserByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const updateUserData = req.body as ClerkUserUpdate;
    const response = await updateClerkUser(req.params.userId, updateUserData);
    return res.status(200).json({
      success: true,
      data: response,
    });
  },
);
