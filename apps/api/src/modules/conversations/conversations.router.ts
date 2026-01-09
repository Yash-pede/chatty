import { Router } from "express";
import { getAllUserConversationsController } from "@/modules/conversations/conversations.controller.js";

const router = Router();

router.use("/", getAllUserConversationsController);

export default router;
