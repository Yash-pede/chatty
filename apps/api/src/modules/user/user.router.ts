import { Router } from "express";
import { getUserByIdController } from "@/modules/user/user.controller.js";
import { validateUserIdMiddleware } from "@/middlewares/validateUserId.middleware.js";

const router = Router();

router.get("/:userId", validateUserIdMiddleware, getUserByIdController);

export default router;
