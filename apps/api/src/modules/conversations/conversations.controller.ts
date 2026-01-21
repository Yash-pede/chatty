import { asyncHandler } from "@/core/asyncHandler.js";
import { Request, Response } from "express";
import {
  getConversationById,
  getConversationMessages,
  getConversationParticipantsByConversationId,
  getConversationsByUserIdWithParticipants
} from "@/modules/conversations/conversations.service.js";
import { getAuth } from "@clerk/express";
import { getUserPresence } from "@/modules/user/user.service.js";

const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

export const getAllUserConversationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const auth = getAuth(req);
    const conversations = await getConversationsByUserIdWithParticipants(
      auth.userId!,
    );

    const presencePromises = conversations.map(async (conversation) => {
      try {
        const status = await getUserPresence(conversation.otherUser.id);
        if (status) {
          conversation.otherUser = { ...conversation.otherUser, status } as any;
        }
      } catch (error) {
        console.error(
          `Failed to fetch presence for ${conversation.otherUser.id}:`,
          error,
        );
      }
    });

    await Promise.all(presencePromises);

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

export const getConversationMessagesController = asyncHandler(
  async (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const { userId } = getAuth(req);

    const rawLimit = Number(req.query.limit);
    const limit = Math.min(
      Math.max(Number.isFinite(rawLimit) ? rawLimit : DEFAULT_LIMIT, 1),
      MAX_LIMIT,
    );
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
    const messageChunk = await getConversationMessages(
      conversationId,
      userId!,
      limit,
      cursor,
    );

    return res.json(messageChunk);
  },
);

export const getConversationPresenceController = asyncHandler(
  async (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const { userId } = getAuth(req);

    const participants =
      await getConversationParticipantsByConversationId(conversationId);

    const presencePromises = participants
      .filter((u) => u.userId !== userId)
      .map(async (participant) => {
        const p = await getUserPresence(participant.userId);
        return { userId: participant.userId, status: p };
      });

    const state: Array<{ userId: string; status: string }> =
      await Promise.all(presencePromises);

    res.status(200).json(state);
  },
);
