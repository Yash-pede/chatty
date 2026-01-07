import { Router } from "express";
import { validateUserIdMiddleware } from "@/middlewares/validateUserId.middleware.js";
import { getAllUserConversationsController } from "@/modules/conversations/conversations.controller.js";

const router = Router();

router.use(
  "/:userId",
  validateUserIdMiddleware,
  getAllUserConversationsController,
);

export default router;
