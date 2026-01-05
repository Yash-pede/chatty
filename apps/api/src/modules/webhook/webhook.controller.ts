import { Response, Request } from "express";
import { Webhook } from "svix";
import { asyncHandler } from "@/core/asyncHandler.js";
import {
  createUser,
  deleteUser,
  updateUser,
} from "@/modules/user/user.service.js";
import { logger } from "@/core/logger.js";
import { InsertUser } from "@/modules/user/user.type.js";
import { env } from "@/config/env.js";

export const getClerkController = asyncHandler(
  async (req: Request, res: Response) => {
    if (!env.CLERK_WEBHOOK_SIGNING_SECRET) {
      throw new Error(
        "Please add CLERK_WEBHOOK_SIGNING_SECRET from Clerk Dashboard to .env",
      );
    }

    const svix_id = req.headers["svix-id"] as string;
    const svix_timestamp = req.headers["svix-timestamp"] as string;
    const svix_signature = req.headers["svix-signature"] as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res
        .status(400)
        .json({ error: "Error occured -- no svix headers" });
    }

    const wh = new Webhook(env.CLERK_WEBHOOK_SIGNING_SECRET);
    let evt: any;

    try {
      evt = wh.verify(req.body.toString(), {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err: any) {
      logger.error("Webhook verification failed:", err.message);
      return res.status(400).json({ error: "Verification failed" });
    }

    const actionType = evt.type;
    const clerkUser = evt.data;

    const primaryEmail =
      clerkUser.email_addresses?.find(
        (email: any) => email.id === clerkUser.primary_email_address_id,
      )?.email_address || clerkUser.email_addresses?.[0]?.email_address;

    const userData: InsertUser & { role: string } = {
      id: clerkUser.id,
      username: clerkUser.username,
      firstName: clerkUser.first_name,
      lastName: clerkUser.last_name,
      role: clerkUser.unsafe_metadata?.role === "agent" ? "agent" : "user",
      email: primaryEmail,
      imageUrl: clerkUser.image_url,
      banned: clerkUser.banned,
      publicMetadata: clerkUser.public_metadata,
      privateMetadata: clerkUser.private_metadata,
      locked: clerkUser.locked,
      hasImage: clerkUser.has_image,
      lastSignInAt: clerkUser.last_sign_in_at
        ? new Date(clerkUser.last_sign_in_at)
        : null,
      lastActiveAt: clerkUser.last_active_at
        ? new Date(clerkUser.last_active_at)
        : null,
      createdAt: new Date(clerkUser.created_at),
      updatedAt: new Date(clerkUser.updated_at),
    };

    switch (actionType) {
      case "user.created":
        logger.info(`Creating User: ${clerkUser}`);
        await createUser(userData);
        return res
          .status(201)
          .json({ status: "success", message: "User created" });

      case "user.updated":
        logger.info(`Updating User: ${clerkUser.id}`);
        await updateUser(userData);
        return res
          .status(200)
          .json({ status: "success", message: "User updated" });

      case "user.deleted":
        logger.info(`Deleting User: ${clerkUser.id}`);
        await deleteUser(clerkUser.id);
        return res.status(200).json({ status: "success" });

      default:
        logger.warn(`Unhandled action type: ${actionType}`);
        return res.status(200).json({ status: "ignored" });
    }
  },
);
