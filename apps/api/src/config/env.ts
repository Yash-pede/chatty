import "dotenv/config";

export const env = {
  PORT: process.env.PORT!,
  CLERK_WEBHOOK_SIGNING_SECRET: process.env.CLERK_WEBHOOK_SIGNING_SECRET!,
};
