import { Router } from "express";
import {
  getAllUserConversationsController,
  getConversationController,
} from "@/modules/conversations/conversations.controller.js";

const router = Router();

router.get("/", getAllUserConversationsController);
router.get("/:conversationId", getConversationController);

export default router;
