import express from "express";
import { Router } from "express";
import { getClerkController } from "@/modules/webhook/webhook.controller.js";

const router = Router();

router.post(
  "/webhooks/clerk",
  express.raw({ type: "application/json" }),
  getClerkController,
);

export default router;
