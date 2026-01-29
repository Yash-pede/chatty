import { Router } from "express";
import {
  getAllUserConversationsController,
  getConversationController,
  getConversationMessageController,
  getConversationMessagesController,
  getConversationPresenceController,
} from "@/modules/conversations/conversations.controller.js";

const router = Router();

router.get("/", getAllUserConversationsController);
router.get("/:conversationId", getConversationController);
router.get("/:conversationId/messages", getConversationMessagesController);
router.get(
  "/:conversationId/messages/:messageId",
  getConversationMessageController,
);
router.get("/:conversationId/presence", getConversationPresenceController);

export default router;
