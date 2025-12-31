import { Response, Request } from "express";
import { asyncHandler } from "@/core/asyncHandler.js";
import {
  createUser,
  deleteUser,
  updateUser,
} from "@/modules/user/user.service.js";
import { logger } from "@/core/logger.js";
import { InsertUser } from "@/modules/user/user.type.js";
import { verifyWebhook } from "@clerk/express/webhooks";

export const getClerkController = asyncHandler(
  async (req: Request, res: Response) => {
    const evt = await verifyWebhook(req);

    const actionType = evt.type;
    const clerkUser = req.body.data;
    const userData: InsertUser & { role: string } = {
      id: clerkUser.id,
      username: clerkUser.username,
      firstName: clerkUser.first_name,
      lastName: clerkUser.last_name,
      fullName: clerkUser.first_name + " " + clerkUser.last_name,
      role: clerkUser.unsafe_metadata?.role ?? "user",
      email: clerkUser.email_addresses[0].email_address,
      imageUrl:
        clerkUser.external_accounts[0].avatar_url ?? clerkUser.image_url,
      banned: clerkUser.banned,
      publicMetadata: clerkUser.public_metadata,
      privateMetadata: clerkUser.private_metadata,
      locked: clerkUser.locked,
      hasImage: clerkUser.has_image,
      lastSignInAt: clerkUser.last_sign_in_at,
      lastActiveAt: clerkUser.last_active_at,
      createdAt: clerkUser.created_at,
      updatedAt: clerkUser.updated_at,
    };
    switch (actionType) {
      case "user.created":
        logger.info("Creating User");
        await createUser(userData);
        return res.status(201).json({
          status: "success",
        });
      case "user.updated":
        logger.info("Updating User");
        await updateUser(userData);
        return res.status(201).json({
          status: "success",
        });
      case "user.deleted":
        logger.info("Deleting User");
        await deleteUser(userData);
        return res.status(201).json({
          status: "success",
        });
      default:
        logger.error(`Unknown action type ${actionType}`);
        return res.status(401).json({
          error: "Invalid action type",
        });
    }
  },
);
