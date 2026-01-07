import { asyncHandler } from "@/core/asyncHandler.js";
import { Request, Response } from "express";
import { getAllUserConversations } from "@/modules/conversations/conversations.service.js";

export const getAllUserConversationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const conversations = await getAllUserConversations(req.params.userId);
    return res.status(200).json(conversations);
  },
);
