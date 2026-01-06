import { Router } from "express";
import { getUserByIdController } from "@/modules/user/user.controller.js";

const router = Router();

router.get("/:userId", getUserByIdController);

export default router;
