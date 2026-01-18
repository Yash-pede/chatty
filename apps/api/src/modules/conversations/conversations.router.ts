import { Router } from "express";
import {
  getAllUserConversationsController,
  getConversationController,
  getConversationMessagesController,
} from "@/modules/conversations/conversations.controller.js";

const router = Router();

router.get("/", getAllUserConversationsController);
router.get("/:conversationId", getConversationController);
router.get("/:conversationId/messages", getConversationMessagesController);

export default router;
