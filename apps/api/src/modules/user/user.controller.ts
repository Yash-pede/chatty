import { asyncHandler } from "@/core/asyncHandler.js";
import { Request, Response } from "express";
import { getUserById } from "@/modules/user/user.service.js";

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
