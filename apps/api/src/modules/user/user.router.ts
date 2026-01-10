import { Router } from "express";
import { getUserByIdController, updateClerkUserByIdController } from "@/modules/user/user.controller.js";
import { validateUserIdMiddleware } from "@/middlewares/validateUserId.middleware.js";

const router = Router();

router.get("/:userId", validateUserIdMiddleware, getUserByIdController);
router.patch("/update-user/:userId", validateUserIdMiddleware, updateClerkUserByIdController);

export default router;
