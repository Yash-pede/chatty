import { asyncHandler } from "@/core/asyncHandler.js";
import { Request, Response } from "express";
import { getUserById, updateClerkUser } from "@/modules/user/user.service.js";

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
    if(!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No data provided for update",
      });
    }
    const response = await updateClerkUser(req.params.userId, req.body)
    return res.status(200).json({
      success: true,
      data: response,
    });
  },
);
