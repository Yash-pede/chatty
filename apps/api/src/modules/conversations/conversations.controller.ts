import { asyncHandler } from "@/core/asyncHandler.js";
import { Request, Response } from "express";
import {
  getConversationById,
  getConversationMessages,
  getConversationsByUserIdWithParticipants,
} from "@/modules/conversations/conversations.service.js";
import { getAuth } from "@clerk/express";

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

export const getAllUserConversationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const auth = getAuth(req);
    const conversations = await getConversationsByUserIdWithParticipants(
      auth.userId!,
    );
    return res.status(200).json({
      success: true,
      data: conversations,
    });
  },
);

export const getConversationController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = getAuth(req);
    const conversation = await getConversationById(
      req.params.conversationId,
      userId!,
    );
    return res.status(200).json({
      success: true,
      data: conversation,
    });
  },
);

export async function getConversationMessagesController(
  req: Request,
  res: Response,
) {
  const { conversationId } = req.params;
  const { userId } = getAuth(req);

  const limit = Math.min(Number(req.query.limit) || DEFAULT_LIMIT, MAX_LIMIT);

  const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
  const messageChunk = await getConversationMessages(
    conversationId,
    userId!,
    limit,
    cursor,
  );
  return res.json(messageChunk);
}
