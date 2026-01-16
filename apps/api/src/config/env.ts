import "dotenv/config";

export const env = {
  PORT: process.env.PORT!,
  CLERK_WEBHOOK_SIGNING_SECRET: process.env.CLERK_WEBHOOK_SIGNING_SECRET!,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY!,
  REDIS_PORT: process.env.REDIS_PORT!,
  REDIS_HOST: process.env.REDIS_HOST!,
};
