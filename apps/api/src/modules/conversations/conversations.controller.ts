import { asyncHandler } from "@/core/asyncHandler.js";
import { Request, Response } from "express";
import { getConversationsByUserIdWithParticipants } from "@/modules/conversations/conversations.service.js";
import { getAuth } from "@clerk/express";

export const getAllUserConversationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const auth = getAuth(req);
    const conversations = await getConversationsByUserIdWithParticipants(
      auth.userId!,
    );
    return res.status(200).json(conversations);
  },
);
